<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MealRequest extends Model
{
    protected $fillable = [
        'area_id',
        'week_start',
        'monday_meal_id',
        'tuesday_meal_id',
        'wednesday_meal_id',
        'thursday_meal_id',
        'friday_meal_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'week_start' => 'date',
        ];
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(MealRequestItem::class);
    }

    // ------------------------------------------------------------------------------------------------------------------

    public function mondayMeal(): BelongsTo
    {
        return $this->belongsTo(Meal::class, 'monday_meal_id');
    }

    public function tuesdayMeal(): BelongsTo
    {
        return $this->belongsTo(Meal::class, 'tuesday_meal_id');
    }

    public function wednesdayMeal(): BelongsTo
    {
        return $this->belongsTo(Meal::class, 'wednesday_meal_id');
    }

    public function thursdayMeal(): BelongsTo
    {
        return $this->belongsTo(Meal::class, 'thursday_meal_id');
    }

    public function fridayMeal(): BelongsTo
    {
        return $this->belongsTo(Meal::class, 'friday_meal_id');
    }
}
