"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DirtyContextType {
    isDirty: boolean
    setIsDirty: (v: boolean) => void
    confirmNavigation: (onConfirm: () => void) => void
}

const DirtyContext = createContext<DirtyContextType>({
    isDirty: false,
    setIsDirty: () => { },
    confirmNavigation: (fn) => fn(), // Default to just running the function
})

export const useDirtyState = () => useContext(DirtyContext)

export function DirtyStateProvider({ children }: { children: ReactNode }) {
    const [isDirty, setIsDirty] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

    // Handle Browser Close / Refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = '' // Chrome requires returnValue to be set
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])

    const confirmNavigation = useCallback((action: () => void) => {
        if (isDirty) {
            setPendingAction(() => action)
            setShowDialog(true)
        } else {
            action()
        }
    }, [isDirty])

    const handleConfirm = () => {
        setIsDirty(false) // Clear dirty state so navigation can proceed
        setShowDialog(false)
        if (pendingAction) {
            pendingAction()
            setPendingAction(null)
        }
    }

    const handleCancel = () => {
        setShowDialog(false)
        setPendingAction(null)
    }

    return (
        <DirtyContext.Provider value={{ isDirty, setIsDirty, confirmNavigation }}>
            {children}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirm}>Leave without saving</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DirtyContext.Provider>
    )
}
