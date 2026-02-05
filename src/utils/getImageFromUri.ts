import { PINATA_URL } from "@/constants";

export async function getImageFromURI(baseURI: string): Promise<string | null> {
  const PINATA_GATEWAY = `${PINATA_URL}/ipfs/`;
  try {
    let metadataUrl = baseURI;
    if (metadataUrl.startsWith("ipfs://")) {
      metadataUrl = metadataUrl.replace("ipfs://", PINATA_GATEWAY);
    } else if (!metadataUrl.startsWith("http")) {
      metadataUrl = `${PINATA_GATEWAY}${metadataUrl}`;
    }

    const res = await fetch(metadataUrl);
    if (!res.ok) return null;

    const metadata = await res.json();
    let imageIpfs = metadata?.image;

    if (!imageIpfs) return null;

    if (imageIpfs.startsWith("ipfs://")) {
      imageIpfs = imageIpfs.replace("ipfs://", PINATA_GATEWAY);
    } else if (!imageIpfs.startsWith("http")) {
      imageIpfs = `${PINATA_GATEWAY}${imageIpfs}`;
    }

    return imageIpfs;
  } catch (err) {
    console.error("Failed to load image from IPFS:", err);
    return null;
  }
}
