"use client";
import { useEffect } from "react";
export function ClearQuiz() { useEffect(() => { try { sessionStorage.removeItem("tripatrop_quiz_v1"); } catch {} }, []); return null; }
