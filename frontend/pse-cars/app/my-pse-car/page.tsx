"use server"

import {redirect} from "next/navigation";
import {v4 as uuidv4} from "uuid";

export default async function Page() {
    const uuid = uuidv4();

    redirect("/my-pse-car/" + uuid);
}