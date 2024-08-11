// components/GoogleSignIn.js
'use client';
import { signInWithPopup, signOut } from 'firebase/auth';
import { Button, Typography} from '@mui/material'
import { auth, provider } from '../lib/firebase';
import { useState, useEffect } from 'react';

const GoogleSignIn = ({ onSignIn, onSignOut }) => {
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            onSignIn(result.user); // Pass the user to the parent component
        } catch (error) {
            console.error("Error signing in with Google: ", error);
        }
    };

    const signOutUser = async () => {
        try {
            await signOut(auth);
            onSignOut();
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (

        <div>
            <Typography variant="h3" >
                Welcome to Chatbot Champs
            </Typography>
            <Button sx={{ color: 'white', backgroundColor: 'grey.500' }} onClick={signInWithGoogle}>Sign in with Google</Button>
   
        </div>
    );
};

export default GoogleSignIn;
