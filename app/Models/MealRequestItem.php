<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealRequestItem extends Model
{
    protected $fillable = [
        'meal_request_id',
        'personnel_id',
        'meal_id',
        'day',
    ];

    protected function casts(): array
    {
        return [
            'day' => 'date',
        ];
    }

    public function mealRequest(): BelongsTo
    {
        return $this->belongsTo(MealRequest::class);
    }

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class);
    }

    public function meal(): BelongsTo
    {
        return $this->belongsTo(Meal::class);
    }
}
