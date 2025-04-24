import Image, {StaticImageData} from "next/image";
import Button from "@/app/components/Button";

export default function ModelPreview({
    className,
    image,
    modelName,
    modelDescription,
}: {
    className?: string;
    image: StaticImageData;
    modelName: string;
    modelDescription: string;
}) {
    return (
        <div
            className={`relative flex flex-col items-center justify-center w-full h-full bg-surface-secondary rounded-lg ${className}`}
        >
            <Image src={image} alt={modelName} className="w-full h-auto rounded-lg" />
            <div className={"absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent rounded-b-lg flex flex-col w-full text-center gap-4"}>
                <div>
                <h3 className="text-3xl font-normal text-font-primary">{modelName}</h3>
                <p className="text-font-secondary font-light text-sm">{modelDescription}</p>
                </div>
                <Button className={"mx-auto"}>Discover Now</Button>
            </div>
        </div>
    );
}