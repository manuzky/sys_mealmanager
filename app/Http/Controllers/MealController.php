<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMealRequest;
use App\Http\Requests\UpdateMealRequest;
use App\Models\Meal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MealController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:meals.view')->only(['index', 'show']);
        $this->middleware('permission:meals.create')->only(['create', 'store']);
        $this->middleware('permission:meals.edit')->only(['edit', 'update']);
        // $this->middleware('permission:meals.delete')->only(['destroy']);
        $this->middleware('permission:meals.toggle-status')->only(['toggleActive']);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function index(Request $request)
    {
        $meals = Meal::query()
            ->when($request->filled('search'), function ($query) use ($request) {$query->where('name', 'like', '%' . $request->search . '%');})
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Meals/Index', [
            'meals' => $meals,
            'filters' => $request->only('search'),
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function create()
    {
        return Inertia::render('Meals/Create');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function store(StoreMealRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('meals', 'public');
        }

        unset($data['photo']);

        Meal::create($data);

        return redirect()
            ->route('meals.index')
            ->with('success', 'Comida registrada correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function edit(Meal $meal)
    {
        return Inertia::render('Meals/Edit', [
            'meal' => $meal,
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function update(UpdateMealRequest $request, Meal $meal)
    {
        $data = $request->validated();
        $oldPhoto = $meal->photo_path;

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('meals', 'public');
        }

        unset($data['photo']);

        $meal->update($data);

        if (isset($data['photo_path']) && $oldPhoto) {
            Storage::disk('public')->delete($oldPhoto);
        }

        return redirect()->route('meals.index')->with('success', 'Comida actualizada correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function toggleActive(Meal $meal)
    {
        $meal->update([
            'active' => !$meal->active,
        ]);

        return back()->with(
            'success',
            $meal->active ? 'Comida activada correctamente.' : 'Comida desactivada correctamente.'
        );
    }
}
