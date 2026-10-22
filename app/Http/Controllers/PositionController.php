<?php
 
namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:positions.view')->only(['index']);
        $this->middleware('permission:positions.create')->only(['create', 'store']);
        $this->middleware('permission:positions.edit')->only(['edit', 'update']);
        $this->middleware('permission:positions.delete')->only(['destroy']);
        $this->middleware('permission:positions.toggle-status')->only(['toggleStatus']);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function index(Request $request)
    {
        $search = $request->search;

        $positions = Position::query()
            ->withCount('personnels')
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Position/Index', [
            'positions' => $positions,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function create()
    {
        return Inertia::render('Position/Create');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $validated['active'] = true;

        Position::create($validated);

        return redirect()
            ->route('positions.index')
            ->with('success', 'Cargo creado correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function edit(Position $position)
    {
        return Inertia::render('Position/Edit', [
            'position' => $position,
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'active' => ['required', 'boolean'],
        ]);

        $position->update($validated);

        return redirect()
            ->route('positions.index')
            ->with('success', 'Cargo actualizado correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function destroy(Position $position)
    {
        if ($position->personnels()->exists()) {
            return back()->withErrors([
                'error' => 'No se puede eliminar este cargo porque tiene personal asignado.',
            ]);
        }

        $position->delete();

        return redirect()
            ->route('positions.index')
            ->with('success', 'Cargo eliminado correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function toggleStatus(Position $position)
    {
        $position->active = !$position->active;
        $position->save();

        return back()->with('success', 'Estado del cargo actualizado correctamente.');
    }
}