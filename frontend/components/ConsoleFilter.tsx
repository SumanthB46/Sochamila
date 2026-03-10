"use client";

import { useEffect } from "react";
import { installConsoleFilter } from "@/lib/console-filter";

export function ConsoleFilter() {
    useEffect(() => {
        installConsoleFilter();
    }, []);
    return null;
}
