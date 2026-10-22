<?php

namespace Database\Seeders;

use App\Models\Personnel;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $personnel = Personnel::where('id_number', '00000001')
            ->firstOrFail();

        $user = User::firstOrNew([
            'username' => 'admin',
        ]);

        $user->name = $personnel->full_name;
        $user->email = $personnel->email;
        $user->personnel_id = $personnel->id;
        $user->active = true;

        if (!$user->exists) {
            $user->password = Hash::make('123456789');
        }

        $user->save();
        $user->syncRoles(['Super Admin']);
    }
}