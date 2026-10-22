
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnels', function (Blueprint $table) {
            $table->id();

            // Datos personales
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('document_type', ['V', 'E']);
            $table->string('id_number')->unique();
            $table->date('birth_date');

            $table->enum('gender', [
                'male',
                'female',
            ]);

            $table->enum('marital_status', [
                'single',
                'married',
                'divorced',
                'widowed',
            ]);

            // Contacto personal
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('secondary_phone')->nullable();
            $table->text('address')->nullable();

            // Cargo
            $table->foreignId('position_id')
                ->nullable()
                ->constrained('positions')
                ->restrictOnDelete();

            $table->foreignId('area_id')
                ->constrained('areas')
                ->restrictOnDelete();

            // Estado y foto
            $table->string('status')->default('active');
            $table->text('photo')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnels');
    }
};
