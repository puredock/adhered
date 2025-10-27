import emailjs from '@emailjs/browser'
import { ArrowRight } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface RequestAccessDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function RequestAccessDialog({ open, onOpenChange }: RequestAccessDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const nameId = useId()
    const emailId = useId()
    const organizationId = useId()
    const messageId = useId()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await emailjs.sendForm(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                e.currentTarget,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
            )

            toast({
                title: 'Request sent successfully!',
                description: 'We will get back to you shortly.',
            })
            onOpenChange(false)
            e.currentTarget.reset()
        } catch (error) {
            console.error('EmailJS error:', error)

            const formData = new FormData(e.currentTarget)
            const data = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                organization: formData.get('organization') as string,
                message: (formData.get('message') as string) || 'N/A',
            }

            const emailBody = `New Access Request for Adhere Platform

Name: ${data.name}
Email: ${data.email}
Organization: ${data.organization}

Message:
${data.message}`.trim()

            navigator.clipboard.writeText(
                `To: h.rajasekaran@imperial.ac.uk\nSubject: Adhere Access Request - ${data.name}\n\n${emailBody}`,
            )

            toast({
                title: 'Email details copied to clipboard',
                description: 'Please paste into your email and send to h.rajasekaran@imperial.ac.uk',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Request Access</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to request access to the Adhere platform. We'll get back
                        to you shortly.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor={nameId}>Name *</Label>
                        <Input id={nameId} name="name" placeholder="Your full name" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={emailId}>Email *</Label>
                        <Input
                            id={emailId}
                            name="email"
                            type="email"
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={organizationId}>Organization *</Label>
                        <Input
                            id={organizationId}
                            name="organization"
                            placeholder="Your hospital or organization"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={messageId}>Message (Optional)</Label>
                        <Textarea
                            id={messageId}
                            name="message"
                            placeholder="Tell us about your use case..."
                            rows={4}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full text-lg font-bold py-6"
                        style={{
                            backgroundColor: 'hsl(var(--sidebar-background))',
                            color: 'hsl(var(--sidebar-foreground))',
                        }}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Request'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
