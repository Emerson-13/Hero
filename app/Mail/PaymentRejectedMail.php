<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function build()
    {
        $userName = $this->payment->user->name;
        $amount = number_format($this->payment->amount, 2);
        $status = ucfirst($this->payment->status);
        $loginUrl = route('login'); 

           return $this->subject('Hero App - Payment Status Update')
                    ->html("
                        <html>
                        <body style=\"font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px;\">
                            <div style=\"max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);\">
                                <h2 style=\"color: #2D82B7;\">Payment Status Updated</h2>
                                <p>Hi <strong>{$userName}</strong>,</p>
                                <p>We regret to inform you that your payment of <strong>\${$amount}</strong> has been <strong>{$status}</strong>.</p>
                                <p>Please check your account and try again. If you believe this is a mistake, contact our support</p>
                                <p>Thank you.</p>
                                <p style=\"text-align: center;\">
                                    <a href=\"{$loginUrl}\" style=\"display: inline-block; padding: 10px 20px; background-color: #2D82B7; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;\">Login to Hero App</a>
                                </p>
                                <p style=\"font-size: 12px; color: #888888; margin-top: 30px;\">This email was sent by Hero App. If you did not make this request, please contact our support team.</p>
                            </div>
                        </body>
                        </html>
                    ");
    }
}

