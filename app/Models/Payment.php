<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'payment_method',
        'bank_name',
        'account_number',
        'transaction_number',
        'proof_image',
        'status',
        'verified_at',
        'verified_by',
    ];
     protected $casts = [
        'verified_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
    // app/Models/Payment.php

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

}
