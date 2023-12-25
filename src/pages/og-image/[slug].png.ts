import type { APIContext, GetStaticPaths } from "astro";
import { getEntryBySlug } from "astro:content";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import { siteConfig } from "@/site-config";
import { getAllPosts, getFormattedDate } from "@/utils";

import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";

const ogOptions: SatoriOptions = {
	width: 1200,
	height: 630,
	// debug: true,
	fonts: [
		{
			name: "Roboto Mono",
			data: Buffer.from(RobotoMono),
			weight: 400,
			style: "normal",
		},
		{
			name: "Roboto Mono",
			data: Buffer.from(RobotoMonoBold),
			weight: 700,
			style: "normal",
		},
	],
};

const markup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]">
		<div tw="flex flex-col flex-1 w-full p-10 justify-center">
			<p tw="text-2xl mb-6">${pubDate}</p>
			<h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full p-10 border-t border-[#2bbc89] text-xl">
			<div tw="flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 100 100">
					<path d="M80.41 29.836H56.32L69.281 43.96zm0 0" fill="#56ace0" />
					<path d="M37.008 45.328h25.98L50 31.152zm0 0" fill="#fff" />
					<path
						d="M75.29 45.328h17.32l-6.962-13.187zm0 0M65.543 50.879H34.605l15.477 38.824zm0 0"
						fill="#ffc10d"
					/>
					<path
						d="M57.969 84.895l32.734-34.016H71.535zm0 0M43.676 29.836h-24.09L30.719 43.96zm0 0M9.297 50.879l33.012 34.328-13.68-34.328zm0 0"
						fill="#56ace0"
					/>
					<path d="M24.707 45.328L14.352 32.141 7.387 45.328zm0 0" fill="#ffc10d" />
					<path
						d="M99.676 46.793L88.578 25.75a2.778 2.778 0 00-2.453-1.48H13.906c-1.02 0-1.976.578-2.453 1.48L.324 46.793c-.543 1.07-.379 2.371.461 3.23l47.223 49.13c1.199 1.136 2.879 1.12 4.015 0l47.223-49.13c.809-.859.973-2.16.43-3.23zM57.969 84.895l13.566-34.051h19.149zM9.297 50.879h19.332l13.68 34.348zm34.379-21.043L30.703 43.96 19.586 29.836zm36.734 0L69.297 43.96 56.32 29.836zM37.008 45.328L50 31.152l12.988 14.176zm-12.301 0H7.387l6.949-13.172zm40.836 5.55L50.066 89.735 34.586 50.88zm9.746-5.55l10.36-13.172 6.945 13.172zm0 0M87.508 17.684L97.996 5.402a2.763 2.763 0 00-.312-3.922 2.759 2.759 0 00-3.918.313L83.277 14.078a2.752 2.752 0 00.313 3.918c1.383 1.152 3.027.66 3.918-.312zm0 0M12.492 17.684c.887.972 2.535 1.449 3.918.312a2.787 2.787 0 00.313-3.918L6.234 1.793a2.787 2.787 0 00-3.918-.313 2.788 2.788 0 00-.312 3.922zm0 0M50 16.86a2.777 2.777 0 002.781-2.782V2.781A2.777 2.777 0 0050 0a2.78 2.78 0 00-2.785 2.781v11.297A2.78 2.78 0 0050 16.86zm0 0"
						fill="#194f82"
					/>
				</svg>
				<p tw="ml-3 font-semibold">${siteConfig.title}</p>
			</div>
			<p>by ${siteConfig.author}</p>
		</div>
	</div>`;

export async function GET({ params: { slug } }: APIContext) {
	const post = await getEntryBySlug("post", slug!);
	const title = post?.data.title ?? siteConfig.title;
	const postDate = getFormattedDate(
		post?.data.updatedDate ?? post?.data.publishDate ?? Date.now(),
		{
			weekday: "long",
			month: "long",
		},
	);
	const svg = await satori(markup(title, postDate), ogOptions);
	const png = new Resvg(svg).render().asPng();
	return new Response(png, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getAllPosts();
	return posts.filter(({ data }) => !data.ogImage).map(({ slug }) => ({ params: { slug } }));
};
