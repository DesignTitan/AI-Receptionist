function decode(value: string) {
  return Uint8Array.from(
    atob(value.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0),
  );
}
function encode(value: ArrayBuffer | null) {
  return value
    ? btoa(String.fromCharCode(...new Uint8Array(value)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")
    : null;
}
export async function ceremony(
  options: Record<string, unknown>,
  register = false,
) {
  if (!window.PublicKeyCredential || !navigator.credentials)
    throw Error(
      "This browser does not support passkeys. Use email and an authenticator instead.",
    );
  const publicKey: any = {
    ...options,
    challenge: decode(options.challenge as string),
  };
  if (register) {
    publicKey.user = {
      ...(options.user as object),
      id: decode((options.user as { id: string }).id),
    };
    publicKey.excludeCredentials = (publicKey.excludeCredentials ?? []).map(
      (c: any) => ({ ...c, id: decode(c.id) }),
    );
  } else
    publicKey.allowCredentials = (publicKey.allowCredentials ?? []).map(
      (c: any) => ({ ...c, id: decode(c.id) }),
    );
  const credential = (await (register
    ? navigator.credentials.create({ publicKey })
    : navigator.credentials.get({ publicKey }))) as PublicKeyCredential | null;
  if (!credential) throw Error("No passkey was selected. Please try again.");
  const response = credential.response;
  const common = {
    id: credential.id,
    rawId: encode(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: credential.authenticatorAttachment,
  };
  return {
    ...common,
    response:
      response instanceof AuthenticatorAttestationResponse
        ? {
            clientDataJSON: encode(response.clientDataJSON),
            attestationObject: encode(response.attestationObject),
            transports: response.getTransports(),
          }
        : {
            clientDataJSON: encode(response.clientDataJSON),
            authenticatorData: encode(
              (response as AuthenticatorAssertionResponse).authenticatorData,
            ),
            signature: encode(
              (response as AuthenticatorAssertionResponse).signature,
            ),
            userHandle: encode(
              (response as AuthenticatorAssertionResponse).userHandle,
            ),
          },
  };
}
