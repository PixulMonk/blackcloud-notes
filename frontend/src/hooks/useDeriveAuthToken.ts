import { useAuth, useAuthActions } from "@/store/useAuthStore";
import { deriveKeysForLogin } from "@/lib/crypto/kdf";
import { fromBase64 } from "@/lib/crypto/crypto-utils";

// TODO: check other components that use useDeriveAuthToken
export const useDeriveAuthToken = () => {
  const { user } = useAuth();
  const { getLoginMetadata } = useAuthActions();

  return async (password: string): Promise<Uint8Array> => {
    if (!user?.email) throw new Error("No user email available");

    const metadata = await getLoginMetadata(user.email);
    if (!metadata) throw new Error("Failed to fetch account metadata");

    const { authToken } = await deriveKeysForLogin(
      password,
      fromBase64(metadata.argon2Salt),
      metadata.argon2Params,
    );
    return authToken;
  };
};
