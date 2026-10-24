<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Meal;
use App\Models\MealRequest;
use App\Models\MealRequestItem;
use App\Models\Personnel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class MealRequestController extends Controller
{

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function index(Request $request)
    {
        $requests = MealRequest::with(['area', 'creator'])
            ->when($request->filled('area_id'), fn ($q) => $q->where('area_id', $request->area_id))
            ->when($request->filled('week_start'), fn ($q) => $q->whereDate('week_start', $request->week_start))
            // ->orderByDesc('week_start')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('MealRequests/Index', [
            'requests' => $requests,
            'areas' => Area::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('area_id', 'week_start'),
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function create()
    {
        return Inertia::render('MealRequests/Create', [
            'areas' => Area::where('active', true)->orderBy('name')->get(['id', 'name']),
            'meals' => Meal::where('active', true)->orderBy('name')->get(['id', 'name', 'ingredients', 'photo_path', 'active']),
            'personnel' => Personnel::with('position:id,name')
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id','first_name','last_name','id_number','area_id','position_id']),
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function store(Request $request)
    {
        $data = $this->validateRequest($request);

        $weekStart = Carbon::parse($data['week_start'])
            ->startOfWeek(Carbon::MONDAY)
            ->toDateString();

        if (MealRequest::where('area_id', $data['area_id'])
            ->whereDate('week_start', $weekStart)
            ->exists()) {throw ValidationException::withMessages(['week_start' => 'Ya existe una solicitud para esta área y semana.',]);}

        $personnelIds = collect($data['items'])
            ->pluck('personnel_id')
            ->unique()
            ->values();

        $this->validatePersonnelArea($personnelIds, $data['area_id']);

        DB::transaction(function () use ($data, $weekStart) {
            $mealRequest = MealRequest::create(array_merge([
                'area_id' => $data['area_id'],
                'week_start' => $weekStart,
                'created_by' => Auth::id(),
            ], $this->generalMenuColumns($data['global_meals'] ?? [])));

            $this->saveItems($mealRequest, $data['items'], $weekStart);
        });

        return redirect()->route('meal-requests.index')->with('success', 'Solicitud semanal registrada correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function edit(MealRequest $meal_request)
    {
        $meal_request->load([
            'area',
            'items.personnel',
            'items.meal',
        ]);

        return Inertia::render('MealRequests/Edit', [
            'mealRequest' => $meal_request,
            'areas' => Area::orderBy('name')->get(['id', 'name']),
            'meals' => Meal::orderBy('name')->get(['id', 'name', 'ingredients', 'photo_path', 'active']),
            'personnel' => Personnel::with('position:id,name')
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id','first_name','last_name','id_number','area_id','position_id']),
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function update(Request $request, MealRequest $meal_request)
    {
        $data = $this->validateRequest($request);

        $weekStart = Carbon::parse($data['week_start'])
            ->startOfWeek(Carbon::MONDAY)
            ->toDateString();

        $exists = MealRequest::where('area_id', $data['area_id'])
            ->whereDate('week_start', $weekStart)
            ->where('id', '!=', $meal_request->id)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages(['week_start' => 'Ya existe una solicitud para esta área y semana.',]);
        }

        $personnelIds = collect($data['items'])
            ->pluck('personnel_id')
            ->unique()
            ->values();

        $this->validatePersonnelArea($personnelIds, $data['area_id']);

        DB::transaction(function () use ($data, $weekStart, $meal_request) {
            $meal_request->update(array_merge([
                'area_id' => $data['area_id'],
                'week_start' => $weekStart,
            ], $this->generalMenuColumns($data['global_meals'] ?? [])));
            $meal_request->items()->delete();
            $this->saveItems($meal_request, $data['items'], $weekStart);
        });

        return redirect()->route('meal-requests.index')->with('success', 'Solicitud semanal actualizada correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function show(MealRequest $meal_request)
    {
        $meal_request->load([
            'area',
            'creator',
            'items.personnel.position',
            'items.meal',
            'mondayMeal',
            'tuesdayMeal',
            'wednesdayMeal',
            'thursdayMeal',
            'fridayMeal',
        ]);

        return Inertia::render('MealRequests/Show', [
            'mealRequest' => $meal_request,
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'area_id' => ['required', 'integer', 'exists:areas,id'],
            'week_start' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.personnel_id' => [
                'required',
                'integer',
                'distinct',
                'exists:personnels,id',
            ],
            'global_meals' => ['nullable', 'array'],
            'items.*.monday' => ['nullable', 'integer', 'exists:meals,id'],
            'items.*.tuesday' => ['nullable', 'integer', 'exists:meals,id'],
            'items.*.wednesday' => ['nullable', 'integer', 'exists:meals,id'],
            'items.*.thursday' => ['nullable', 'integer', 'exists:meals,id'],
            'items.*.friday' => ['nullable', 'integer', 'exists:meals,id'],
        ], [
            'items.required' => 'Debes asignar comidas a los trabajadores.',
            'items.min' => 'Debes incluir al menos un trabajador.',
            'items.*.personnel_id.distinct' => 'Un trabajador no puede repetirse.',
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    private function validatePersonnelArea($personnelIds, int $areaId): void
    {
        $validCount = Personnel::whereIn('id', $personnelIds)
            ->where('area_id', $areaId)
            ->count();

        if ($validCount !== $personnelIds->count()) {
            throw ValidationException::withMessages(['items' => 'Todos los trabajadores deben pertenecer al área seleccionada.',]);
        }
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    private function generalMenuColumns(array $globalMeals): array
    {
        return [
            'monday_meal_id' => !empty($globalMeals['monday']) ? $globalMeals['monday'] : null,
            'tuesday_meal_id' => !empty($globalMeals['tuesday']) ? $globalMeals['tuesday'] : null,
            'wednesday_meal_id' => !empty($globalMeals['wednesday']) ? $globalMeals['wednesday'] : null,
            'thursday_meal_id' => !empty($globalMeals['thursday']) ? $globalMeals['thursday'] : null,
            'friday_meal_id' => !empty($globalMeals['friday']) ? $globalMeals['friday'] : null,
        ];
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    private function saveItems(MealRequest $mealRequest, array $items, string $weekStart): void
    {
        $days = [
            'monday' => 0,
            'tuesday' => 1,
            'wednesday' => 2,
            'thursday' => 3,
            'friday' => 4,
        ];

        $rows = [];

        foreach ($items as $item) {
            foreach ($days as $key => $offset) {
                $mealId = $item[$key] ?? null;

                $rows[] = [
                    'personnel_id' => $item['personnel_id'],
                    'meal_id' => $mealId !== '' ? $mealId : null,
                    'day' => Carbon::parse($weekStart)
                        ->addDays($offset)
                        ->toDateString(),
                ];
            }
        }

        if ($rows) {
            $mealRequest->items()->createMany($rows);
        }
    }
}
