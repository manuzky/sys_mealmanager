<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:areas.view')->only('index');
        $this->middleware('permission:areas.create')->only(['create', 'store']);
        $this->middleware('permission:areas.edit')->only(['edit', 'update']);
        $this->middleware('permission:areas.delete')->only('destroy');
        $this->middleware('permission:areas.toggle-status')->only('toggleStatus');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function index(Request $request)
    {
        $search = $request->search;

        $areas = Area::query()
            ->withCount('personnels')
            ->when($search, fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Areas/Index', [
            'areas' => $areas,
            'filters' => ['search' => $search],
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function create()
    {
        return Inertia::render('Areas/Create');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:areas,name'],
            'description' => ['nullable', 'string'],
        ]);

        Area::create($validated);

        return redirect()->route('areas.index')
            ->with('success', 'Área creada correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function edit(Area $area)
    {
        return Inertia::render('Areas/Edit', compact('area'));
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function update(Request $request, Area $area)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:areas,name,' . $area->id],
            'description' => ['nullable', 'string'],
        ]);

        $area->update($validated);

        return redirect()->route('areas.index')
            ->with('success', 'Área actualizada correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function destroy(Area $area)
    {
        if ($area->personnels()->exists()) {
            return back()->withErrors([
                'error' => 'No se puede eliminar un área que tiene personal asignado.',
            ]);
        }

        $area->delete();

        return redirect()->route('areas.index')
            ->with('success', 'Área eliminada correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function toggleStatus(Area $area)
    {
        $area->active = !$area->active;
        $area->save();

        return back()->with('success', 'Estado del área actualizado correctamente.');
    }
}
