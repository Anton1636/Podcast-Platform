'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useReducer, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import GeneratePodcast from '@/components/GeneratePodcast'
import GenerateThumbnail from '@/components/GenerateThumbnail'
import { Loader } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'
import { useToast } from '@/components/ui/use-toast'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
	username: z.string().min(2),
	podcastDescription: z.string().min(2),
})

const voiceCategories = ['alloy', 'shimmer', 'nova', 'echo', 'fable', 'onyx']

const CreatePodcast = () => {
	const router = useRouter()
	const [voiceType, setVoiceType] = useState<string | null>(null)
	const [voicePrompt, setVoicePrompt] = useState('')

	const [isSubmitting, setIsSubmitting] = useState(false)

	const { toast } = useToast()

	const [imagePrompt, setImagePrompt] = useState('')
	const [imageStorageID, setImageStorageID] = useState<Id<'_storage'> | null>(
		null
	)
	const [imageUrl, setImageUrl] = useState('')

	const [audioStorageID, setAudioStorageID] = useState<Id<'_storage'> | null>(
		null
	)
	const [audioUrl, setAudioUrl] = useState('')
	const [audioDuration, setAudioDuration] = useState(0)

	const createPodcast = useMutation(api.podcasts.createPodcast)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
			podcastDescription: '',
		},
	})

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			setIsSubmitting(true)

			if (!audioUrl || !imageUrl || !voiceType) {
				toast({ title: 'Please generate audio and image' })
				setIsSubmitting(false)
				throw new Error('Please generate audio and image')
			}
			const podcast = await createPodcast({
				podcastTitle: data.username,
				podcastDescription: data.podcastDescription,
				audioUrl,
				imageUrl,
				voiceType,
				imagePrompt,
				voicePrompt,
				views: 0,
				audioDuration,
				audioStorageID: audioStorageID!,
				imageStorageID: imageStorageID!,
			})
			toast({ title: 'Podcast created' })
			setIsSubmitting(false)
			router.push('/')
		} catch (error) {
			console.log(error)
			toast({ title: 'Error', variant: 'destructive' })
			setIsSubmitting(false)
		}
	}

	return (
		<section className='mt-10 flex flex-col'>
			<h1 className='text-20 font-bold text-white-1'>CreatePodcast</h1>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='mt-12 flex w-full flex-col'
				>
					<div className='flex flex-col gap-[30px] border-b border-black-5 pb-10'>
						<FormField
							control={form.control}
							name='username'
							render={({ field }) => (
								<FormItem className='flex flex-col gap-2.5'>
									<FormLabel className='text-16 font-bold text-white-1'>
										Title
									</FormLabel>
									<FormControl>
										<Input
											className='input-class focus-visible:ring-offset-orange-1'
											placeholder='Podcast'
											{...field}
										/>
									</FormControl>
									<FormMessage className='text-white-1' />
								</FormItem>
							)}
						/>

						<div className='flex flex-col gap-2.5'>
							<Label className='text-16 font-bold text-white-1'>
								Select AI Voice
							</Label>

							<Select onValueChange={value => setVoiceType(value)}>
								<SelectTrigger
									className={cn(
										'w-full text-16 border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1'
									)}
								>
									<SelectValue
										placeholder='Select AI Voice'
										className='placeholder:text-gray-1'
									/>
								</SelectTrigger>
								<SelectContent className='text-16 border-none bg-black-1 font-bold text-white-1 focus-visible:ring-offset-orange-1'>
									{voiceCategories.map(category => (
										<SelectItem
											key={category}
											value={category}
											className='capitalize focus:bg-orange-1'
										>
											{category}
										</SelectItem>
									))}
								</SelectContent>
								{voiceType && (
									<audio src={`/${voiceType}.m3`} autoPlay className='hidden' />
								)}
							</Select>
						</div>

						<FormField
							control={form.control}
							name='podcastDescription'
							render={({ field }) => (
								<FormItem className='flex flex-col gap-2.5'>
									<FormLabel className='text-16 font-bold text-white-1'>
										Description
									</FormLabel>
									<FormControl>
										<Textarea
											className='input-class focus-visible:ring-offset-orange-1'
											placeholder='Write a short description'
											{...field}
										/>
									</FormControl>
									<FormMessage className='text-white-1' />
								</FormItem>
							)}
						/>
					</div>
					<div className='flex flex-col pt-10'>
						<GeneratePodcast
							setAudioStorageId={setAudioStorageID}
							setAudio={setAudioUrl}
							voiceType={voiceType!}
							audio={audioUrl}
							voicePrompt={voicePrompt}
							setVoicePrompt={setVoicePrompt}
							setAudioDuration={setAudioDuration}
						/>
						<GenerateThumbnail
							setImage={setImageUrl}
							setImageStorageId={setImageStorageID}
							image={imageUrl}
							imagePrompt={imagePrompt}
							setImagePrompt={setImagePrompt}
						/>

						<div className='mt-10 w-full'>
							<Button
								type='submit'
								className='text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1'
							>
								{isSubmitting ? (
									<>
										Submitting
										<Loader size={20} className='animate-spin ml-2' />
									</>
								) : (
									'Submit & Publish Podcast '
								)}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</section>
	)
}
export default CreatePodcast
