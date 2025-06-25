"use client"

import {redirect} from "next/navigation";
import {v4 as uuidv4} from "uuid";
import {useEffect} from "react";

export default function Page() {
    useEffect(() => {
        const uuid = uuidv4();

        redirect("/my-pse-car/" + uuid);
    }, []);
}