<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ActivationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;

    public function __construct($code)
    {
        $this->code = $code;
    }

    public function build()
    {
        $loginUrl = route('login'); // Laravel login route

        return $this->subject('Hero App - Your Activation Code')
                    ->html("
                        <html>
                        <body style=\"font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px;\">
                            <div style=\"max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);\">
                                <h2 style=\"color: #2D82B7;\">Welcome to Hero App!</h2>
                                <p>Hi there,</p>
                                <p>Your account has been approved by the admin. Please use the activation code below to activate your account and log in:</p>
                                <p style=\"text-align: center; font-size: 20px; font-weight: bold; color: #333; margin: 20px 0;\">{$this->code}</p>
                                <p style=\"text-align: center;\">
                                    <a href=\"{$loginUrl}\" style=\"display: inline-block; padding: 10px 20px; background-color: #2D82B7; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;\">Login to Hero App</a>
                                </p>
                                <p style=\"font-size: 12px; color: #888888; margin-top: 30px;\">If you did not request this, please ignore this email or contact our support team.</p>
                            </div>
                        </body>
                        </html>
                    ");
    }
}
