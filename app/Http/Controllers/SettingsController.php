<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('MerchantSetting/Settings');
    }

    //public function about()
    //{
      //  return Inertia::render('Settings/About');
    //}

    public function fax()
    {
        return Inertia::render('MerchantSetting/FaxSettings');
    }
   
}


