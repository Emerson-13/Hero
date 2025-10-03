<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',  
        'is_active',
        'is_suspended',
        'payment_status',
        'phone', 
        'address', 
        'package_id',
        'title_id',
        'created_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function referralCode()
    {
        return $this->hasOne(ReferralCode::class,'user_id');
    }
    // The referral record where this user was referred
    public function referral() {
        return $this->hasOne(Referral::class, 'referred_user_id', 'id');
    }

    // The user who referred this user
    public function referrer() {
        return $this->belongsTo(User::class, 'referrer_id', 'id');
    }

    public function referrals()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referredBy()
    {
        return $this->hasMany(Referral::class, 'referred_user_id');
    }
    public function activationCode()
    {
        return $this->hasOne(ActivationCode::class, 'used_by', 'id');
    }
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }
    // app/Models/User.php

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
        public function title()
    {
        return $this->belongsTo(Title::class);
    }
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}   
