<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\StorePersonnelRequest;
use App\Http\Requests\UpdatePersonnelRequest;
use App\Models\EmergencyContactRelationship;
use App\Models\Personnel;
use App\Models\Position;

class PersonnelController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:personnel.view')->only(['index', 'show']);
        $this->middleware('permission:personnel.create')->only(['create', 'store']);
        $this->middleware('permission:personnel.edit')->only(['edit', 'update']);
        $this->middleware('permission:personnel.toggle-status')->only(['toggleStatus']);
    }
    
    /*------------------------------------------------------------------------------------------------------------------------------------------*/
    
    public function index(Request $request)
    {
        $search = $request->search;

        $personnels = Personnel::query()
            ->with('position')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('id_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Personnel/Index', [
            'personnels' => $personnels,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function create()
    {
        return Inertia::render('Personnel/Create', [
            'positions' => Position::where('active', true)->get(),
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function store(StorePersonnelRequest $request)
    {
        $validated = $request->validated();

        $photoPath = $request->hasFile('photo')
            ? $request->file('photo')->store('personnel/photos', 'public')
            : null;

        $email = $this->buildEmail($validated);

        $phone = !empty($validated['phone'])
            ? ($validated['phone_code'] ?? '') . $validated['phone']
            : null;

        $secondaryPhone = !empty($validated['secondary_phone'])
            ? ($validated['secondary_phone_code'] ?? '') . $validated['secondary_phone']
            : null;

        DB::transaction(function () use (
            $validated,
            $photoPath,
            $email,
            $phone,
            $secondaryPhone
        ) {
            Personnel::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'document_type' => $validated['document_type'],
                'id_number' => $validated['id_number'],
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'],
                'marital_status' => $validated['marital_status'],
                'email' => $email,
                'phone' => $phone,
                'secondary_phone' => $secondaryPhone,
                'address' => $validated['address'] ?? null,
                'position_id' => $validated['position_id'],
                'status' => 'active',
                'photo' => $photoPath,
            ]);
        });

        return redirect()
            ->route('personnel.index')
            ->with('success', 'Personal registrado correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function show(Personnel $personnel)
    {
        $personnel->load([
            'position',
            'user.roles',
        ]);

        return Inertia::render('Personnel/Show', [
            'personnel' => $personnel,
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function edit(Personnel $personnel)
    {
        $positions = Position::where('active', true)->get();

        // Si el cargo actual está inactivo, se conserva como opción.
        if (
            $personnel->position &&
            !$positions->contains('id', $personnel->position->id)
        ) {
            $positions->push($personnel->position);
        }

        return Inertia::render('Personnel/Edit', [
            'personnel' => $personnel->load('position'),
            'positions' => $positions,
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function update( UpdatePersonnelRequest $request, Personnel $personnel ) {
        $validated = $request->validated();

        $email = $this->buildEmail($validated);

        $phone = !empty($validated['phone'])
            ? ($validated['phone_code'] ?? '') . $validated['phone']
            : null;

        $secondaryPhone = !empty($validated['secondary_phone'])
            ? ($validated['secondary_phone_code'] ?? '') . $validated['secondary_phone']
            : null;

        $photoPath = $personnel->photo;

        if ($request->boolean('photo_remove')) {
            if ($photoPath) {
                Storage::disk('public')->delete($photoPath);
            }

            $photoPath = null;
        }

        if ($request->hasFile('photo')) {
            if ($photoPath) {
                Storage::disk('public')->delete($photoPath);
            }

            $photoPath = $request->file('photo')
                ->store('personnel/photos', 'public');
        }

        DB::transaction(function () use (
            $personnel,
            $validated,
            $email,
            $phone,
            $secondaryPhone,
            &$photoPath
        ) {
            $personnel->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'document_type' => $validated['document_type'],
                'id_number' => $validated['id_number'],
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'],
                'marital_status' => $validated['marital_status'],
                'email' => $email,
                'phone' => $phone,
                'secondary_phone' => $secondaryPhone,
                'address' => $validated['address'] ?? null,
                'position_id' => $validated['position_id'],
                'photo' => $photoPath,
            ]);
        });

        return redirect()
            ->route('personnel.index')
            ->with('success', 'Personal actualizado correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function destroy(Personnel $personnel)
    {
        // Here's not a real delete, just a status change to 'inactive' to keep the data for historical purposes.
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function toggleStatus(Personnel $personnel)
    {
        $personnel->status = match ($personnel->status) {
            'active' => 'inactive',
            'inactive' => 'active',
            default => 'inactive',
        };

        $personnel->save();

        return back();
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    private function buildEmail(array $validated): string
    {
        $domain = $validated['email_domain'] === 'other'
            ? $validated['email_custom_domain']
            : $validated['email_domain'];

        if (!str_starts_with($domain, '@')) {
            $domain = '@' . $domain;
        }

        return $validated['email_local'] . $domain;
    }
}
