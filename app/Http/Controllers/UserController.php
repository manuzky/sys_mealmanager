<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Personnel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:users.view')->only(['index', 'show']);
        $this->middleware('permission:users.create')->only(['create', 'store']);
        $this->middleware('permission:users.edit')->only(['edit', 'update']);
        $this->middleware('permission:users.toggle-status')->only(['toggleStatus']);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function index(Request $request)
    {
        $search = $request->search;

        $users = User::with('personnel.position')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('personnel', function ($query) use ($search) {
                            $query->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => Role::orderBy('name')->get(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function create()
    {
        $personnels = Personnel::query()
            ->with('position')
            ->whereDoesntHave('user')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('Users/Create', [
            'personnels' => $personnels,
            'roles' => Role::with('permissions')->orderBy('name')->get(),
            'permissionGroups' => $this->getPermissionGroups(),
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $personnel = Personnel::findOrFail($validated['personnel_id']);

        if ($personnel->user()->exists()) {
            return back()
                ->withErrors([
                    'personnel_id' => 'Esta persona ya tiene un usuario asignado.',
                ])
                ->withInput();
        }

        $user = User::create([
            'personnel_id' => $personnel->id,
            'name' => trim($personnel->first_name . ' ' . $personnel->last_name),
            'username' => $validated['username'],
            'email' => $personnel->email,
            'password' => Hash::make($validated['password']),
            'active' => true,
        ]);

        $user->assignRole($validated['role']);
        $user->givePermissionTo($validated['permissions'] ?? []);

        return redirect()
            ->route('users.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function show(User $user)
    {
        $user->load([
            'personnel.position',
            'roles',
        ]);

        $personnel = $user->personnel;

        return Inertia::render('Users/Show', [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'active' => $user->active,
                'created_at' => $user->created_at?->format('d/m/Y H:i'),
                'roles' => $user->getRoleNames(),

                'personnel' => $personnel ? [
                    'id' => $personnel->id,
                    'first_name' => $personnel->first_name,
                    'last_name' => $personnel->last_name,
                    'full_name' => $personnel->full_name,
                    'email' => $personnel->email,
                    'document_type' => $personnel->document_type,
                    'id_number' => $personnel->id_number,
                    'phone' => $personnel->phone,
                    'status' => $personnel->status,
                    'photo' => $personnel->photo,
                    'position' => $personnel->position?->name,
                ] : null,
            ],
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function edit(User $user)
    {
        $user->load(['personnel', 'roles']);

        $personnels = Personnel::query()
            ->with('position')
            ->where(function ($query) use ($user) {
                $query->whereDoesntHave('user')
                    ->orWhere('id', $user->personnel_id);
            })
            ->orderBy('first_name')
            ->get();

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'personnels' => $personnels,
            'roles' => Role::with('permissions')->orderBy('name')->get(),
            'permissionGroups' => $this->getPermissionGroups(),
            'userRoles' => $user->getRoleNames()->toArray(),
            'userPermissions' => $user->getDirectPermissions()
                ->pluck('name')
                ->values(),
        ]);
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();
        $personnel = Personnel::findOrFail($validated['personnel_id']);

        if ($personnel->user()->where('id', '!=', $user->id)->exists()) {
            return back()
                ->withErrors([
                    'personnel_id' => 'Esta persona ya tiene otro usuario asignado.',
                ])
                ->withInput();
        }

        $user->personnel_id = $personnel->id;
        $user->name = trim($personnel->first_name . ' ' . $personnel->last_name);
        $user->email = $personnel->email;
        $user->username = $validated['username'];

        if (
            !empty($validated['change_password']) &&
            !empty($validated['password'])
        ) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        $user->syncRoles([$validated['role']]);
        $user->syncPermissions($validated['permissions'] ?? []);

        return redirect()
            ->route('users.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function destroy(User $user)
    {
        // La eliminación de usuarios queda pendiente de definir.
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    public function toggleStatus(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->withErrors([
                'error' => 'No puedes deshabilitar tu propio usuario.',
            ]);
        }

        $user->active = !$user->active;
        $user->save();

        return back()->with('success', 'Estado del usuario actualizado correctamente.');
    }

    /*------------------------------------------------------------------------------------------------------------------------------------------*/

    private function getPermissionGroups()
    {
        return Permission::orderBy('name')
            ->get(['id', 'name', 'display_name'])
            ->groupBy(fn ($permission) => ucfirst(explode('.', $permission->name)[0]))
            ->map(fn ($permissions, $group) => [
                'name' => $group,
                'permissions' => $permissions->values(),
            ])
            ->values();
    }
}