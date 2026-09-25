import Image from "next/image";
import { Scene } from "./Scene";
import { PHOTOS } from "@/lib/photos";

export function Photo({ id, priority = false, sizes = "(max-width: 900px) 50vw, 25vw" }: { id: keyof typeof PHOTOS; priority?: boolean; sizes?: string }) {
  const p = PHOTOS[id];
  return (
    <div className="media">
      {p.src ? <Image src={p.src} alt={p.alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover" }} /> : <><Scene kind={p.scene} /><span className="sr-only">{p.alt}</span></>}
    </div>
  );
}
