'use client'

import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Header from './Header'
import Carousel from './Carousel'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
import LoaderSpinner from './LoaderSpinner'
import { useAudio } from '@/providers/AudioProvider'
import { cn } from '@/lib/utils'

const RightSidebar = () => {
	const { user } = useUser()
	const topPodcast = useQuery(api.users.getTopUserByPodcastCount)
	const router = useRouter()
	const { audio } = useAudio()

	if (!topPodcast) return <LoaderSpinner />

	return (
		<section
			className={cn('right_sidebar h-[calc(100vh-5px)]', {
				'h-[calc(100vh-140px)]': audio?.audioUrl,
			})}
		>
			<SignedIn>
				<Link href={`/profile/${user?.id}`} className='flex gap-3 pb-12'>
					<UserButton />
					<div className='flex w-full items-center justify-between'>
						<h1 className='text-16 truncate font-semibold text-white-1'>
							{user?.firstName} {user?.lastName}
						</h1>
						<Image
							src='/icons/right-arrow.svg'
							alt='arrow'
							width={24}
							height={24}
						/>
					</div>
				</Link>
			</SignedIn>

			<section>
				<Header headerTitle='Fans Like You' />
				<Carousel fansLikeDetail={topPodcast!} />
			</section>

			<section className='flex flex-col gap-8 pt-12'>
				<Header headerTitle='Top Podcast' />
				<div className='flex flex-col gap-6'>
					{topPodcast?.slice(0, 3).map(podcast => (
						<div
							key={podcast._id}
							className='flex cursor-pointer justify-between'
							onClick={() => router.push(`/profile/${podcast.clerkId}`)}
						>
							<figure className='flex items-center gap-2'>
								<Image
									src={podcast.imageUrl}
									alt={podcast.name}
									width={44}
									height={44}
									className='aspect-square rounded-lg'
								/>
								<h2 className='text-14 font-semibold text-white-1'>
									{podcast.name}
								</h2>
							</figure>
							<div className='flex items-center'>
								<p className='text-12 font-normal text-white-1'>
									{podcast.totalPodcasts} podcasts
								</p>
							</div>
						</div>
					))}
				</div>
			</section>
		</section>
	)
}

export default RightSidebar
