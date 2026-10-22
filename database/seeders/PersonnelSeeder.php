<?php

namespace Database\Seeders;

use App\Models\Personnel;
use App\Models\Position;
use Illuminate\Database\Seeder;

class PersonnelSeeder extends Seeder
{
    public function run(): void
    {
        $adminPosition = Position::where(
            'name',
            'Administrador del Sistema'
        )->firstOrFail();

        Personnel::updateOrCreate(
            ['id_number' => '00000001'],
            [
                'first_name' => 'Administrador',
                'last_name' => 'Sistema',
                'document_type' => 'V',
                'birth_date' => '1990-01-01',
                'gender' => 'male',
                'marital_status' => 'single',
                'email' => 'admin@system.com',
                'phone' => '04120000000',
                'secondary_phone' => null,
                'address' => 'Oficina Principal',
                'position_id' => $adminPosition->id,
                'status' => 'active',
                'photo' => null,
            ]
        );
    }
}