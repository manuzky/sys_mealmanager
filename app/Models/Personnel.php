<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personnel extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'document_type',
        'id_number',
        'birth_date',
        'gender',
        'marital_status',
        'email',
        'phone',
        'secondary_phone',
        'address',
        'position_id',
        'area_id',
        'status',
        'photo',
    ];

    protected $casts = [
        'birth_date' => 'date:Y-m-d',
    ];

    protected $appends = ['full_name'];

    protected static function booted(): void
    {
        static::updated(function (Personnel $personnel) {
            $personnel->loadMissing('user');

            if (!$personnel->user) {
                return;
            }

            $changes = [];

            if ($personnel->wasChanged('email')) {
                $changes['email'] = $personnel->email;
            }

            if (
                $personnel->wasChanged('first_name') ||
                $personnel->wasChanged('last_name')
            ) {
                $changes['name'] = $personnel->full_name;
            }

            if (!empty($changes)) {
                $personnel->user->update($changes);
            }
        });
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }
}
