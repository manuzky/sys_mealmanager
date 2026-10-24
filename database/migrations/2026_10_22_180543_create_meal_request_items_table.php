<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('meal_request_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('meal_request_id')
                ->constrained('meal_requests')
                ->cascadeOnDelete();

            $table->foreignId('personnel_id')
                ->constrained('personnels')
                ->restrictOnDelete();

            $table->foreignId('meal_id')
                ->nullable()
                ->constrained('meals')
                ->nullOnDelete();

            $table->date('day');
            $table->timestamps();

            $table->unique([
                'meal_request_id',
                'personnel_id',
                'day',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_request_items');
    }
};
