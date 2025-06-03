// src/viewmodels/VerificationViewModel.js

import { auth } from '../services/firebase';
import { reload } from 'firebase/auth';

export const VerificationViewModel = {
  async checkVerificationStatus() {
    try {
      await reload(auth.currentUser);
      const user = auth.currentUser;
      return { verified: user.emailVerified };
    } catch (error) {
      console.error("⚠️ Verification Error:", error);
      return { error };
    }
  }
};
