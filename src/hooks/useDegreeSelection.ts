 import { useState, useEffect, useCallback } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { toast } from "sonner";
 
 export type DegreePath = "associate" | "bachelor" | "certificate" | null;
 export type CertificateDepartment = "cinematography" | "post-production" | "directing" | "production" | null;
 
 interface DegreeSelection {
   degreePath: DegreePath;
   certificateDepartment: CertificateDepartment;
   loading: boolean;
   error: Error | null;
   setDegreeSelection: (path: DegreePath, department?: CertificateDepartment) => Promise<boolean>;
   clearDegreeSelection: () => Promise<boolean>;
 }
 
 export function useDegreeSelection(): DegreeSelection {
   const { user } = useAuth();
   const [degreePath, setDegreePath] = useState<DegreePath>(null);
   const [certificateDepartment, setCertificateDepartment] = useState<CertificateDepartment>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);
 
   // Fetch current selection on mount
   useEffect(() => {
     if (!user) {
       setDegreePath(null);
       setCertificateDepartment(null);
       setLoading(false);
       return;
     }
 
     const fetchSelection = async () => {
       try {
         const { data, error: fetchError } = await supabase
           .from("profiles")
           .select("degree_path, certificate_department")
           .eq("user_id", user.id)
           .maybeSingle();
 
         if (fetchError) throw fetchError;
 
         setDegreePath(data?.degree_path as DegreePath);
         setCertificateDepartment(data?.certificate_department as CertificateDepartment);
       } catch (err) {
         setError(err as Error);
       } finally {
         setLoading(false);
       }
     };
 
     fetchSelection();
   }, [user]);
 
   const setDegreeSelection = useCallback(
     async (path: DegreePath, department?: CertificateDepartment): Promise<boolean> => {
       if (!user) {
         toast.error("You must be logged in to select a degree path");
         return false;
       }
 
       // Validate certificate requires department
       if (path === "certificate" && !department) {
         toast.error("Please select a department for your certificate");
         return false;
       }
 
       try {
         const updates: { degree_path: DegreePath; certificate_department: CertificateDepartment } = {
           degree_path: path,
           certificate_department: path === "certificate" ? department! : null,
         };
 
         const { error: updateError } = await supabase
           .from("profiles")
           .update(updates)
           .eq("user_id", user.id);
 
         if (updateError) throw updateError;
 
         setDegreePath(path);
         setCertificateDepartment(path === "certificate" ? department! : null);
 
         const pathNames = {
           associate: "Associate of Film",
           bachelor: "Bachelor of Film",
           certificate: `Certificate in ${department ? department.charAt(0).toUpperCase() + department.slice(1) : ""}`,
         };
 
         toast.success(`Enrolled in ${pathNames[path!]}`);
         return true;
       } catch (err) {
         toast.error("Failed to save degree selection");
         setError(err as Error);
         return false;
       }
     },
     [user]
   );
 
   const clearDegreeSelection = useCallback(async (): Promise<boolean> => {
     if (!user) return false;
 
     try {
       const { error: updateError } = await supabase
         .from("profiles")
         .update({ degree_path: null, certificate_department: null })
         .eq("user_id", user.id);
 
       if (updateError) throw updateError;
 
       setDegreePath(null);
       setCertificateDepartment(null);
       toast.success("Degree path cleared");
       return true;
     } catch (err) {
       toast.error("Failed to clear degree selection");
       return false;
     }
   }, [user]);
 
   return {
     degreePath,
     certificateDepartment,
     loading,
     error,
     setDegreeSelection,
     clearDegreeSelection,
   };
 }