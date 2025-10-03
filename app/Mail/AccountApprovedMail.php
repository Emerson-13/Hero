<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $userName = $this->user->name;
        $loginUrl = route('login');

        return $this->subject('Hero App - Account Approved & Payment Instructions')
                    ->html("
                        <html>
                        <body style=\"font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px;\">
                            <div style=\"max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);\">
                                <h2 style=\"color: #2D82B7;\">Your Account Has Been Approved 🎉</h2>
                                <p>Hi <strong>{$userName}</strong>,</p>
                                <p>Your account has been <strong>approved</strong>. Please proceed to settle your payment to fully activate your account.</p>

                                <p style=\"text-align: center; margin: 20px 0;\">
                                    <a href=\"{$loginUrl}\" style=\"display: inline-block; padding: 12px 24px; background-color: #2D82B7; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;\">Login to Hero App</a>
                                </p>

                                <p>Once logged in, you will see your payment instructions and the exact amount to pay.</p>

                                <p style=\"font-size: 12px; color: #888888; margin-top: 30px;\">This email was sent by Hero App. If you did not register, please ignore this message or contact our support team.</p>
                            </div>
                        </body>
                        </html>
                    ");
    }
}
