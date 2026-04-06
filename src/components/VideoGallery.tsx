import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRef, useEffect } from 'react';

const videos = [
    "https://res.cloudinary.com/dwog6t2uq/video/upload/f_auto,q_auto/v1775494226/AQPCvMvl8z5TM8cxTsmmbtyJIK2wR5KFOV3Ydcpm6BYMQ517pn6xrxDE10tjcOXWxNK55rkwspLF2SSB_uf4TYOTeD5TPEIGlgDV0Kg.mp4",
    "https://res.cloudinary.com/dwog6t2uq/video/upload/f_auto,q_auto/v1775494191/AQMHZzCMOhi6YVLohBsi49X1i46DI_IiJa2NX1GgAb7d7eALCngIdTGFYHdvF4FqI2JAd8LCOpbh3sctJSjpA9SJEZhyicxUvG6MPS4.mp4",
    "https://res.cloudinary.com/dwog6t2uq/video/upload/f_auto,q_auto/v1/AQPMzejmnB6Oa7Kdoh3eCy86fD4qvpEwaon0FYWFxNz7vtRiRaPIqDi7BobbMgOUbTSpf3jFQdmAoXz6oG5uSY571TPXxCJ2XanMbb4_1.mp4",
    "https://res.cloudinary.com/dwog6t2uq/video/upload/f_auto,q_auto/v1775494200/AQMlQnW7Nrp5Vey_OPA6StN46fKYwzZGDOEIiZOemv-0PgwE2XkKzFizqQ6AwIK_8ZDvAHcNsW0eyj1Mph34p_BgXvGSYFDUOhMdX3M.mp4",
    "https://res.cloudinary.com/dwog6t2uq/video/upload/f_auto,q_auto/v1775494212/AQOqKNf-6pLTgriV3UH800h1hD0ZbhL3vSq_f2Uc363QwF6exUHwwdYw9_bhpz9SVbD4OFgDqM2iHT-uMboCThR9WFLWBUrjBNqNHEg.mp4",
    "https://res.cloudinary.com/dwog6t2uq/video/upload/f_auto,q_auto/v1/AQNyFaAzlyc65ailkgTwVWvimyoN5f5h-hVPkgcLYbhBhwh55wYHL000iU3BJs-yZqFK0jOUzAC3Fkvo5e0uK_1ZCLzPHBDcWIL-svE.mp4"
];

const VideoItem = ({ src, idx }: { src: string; idx: number }) => {
    const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px 0px' });
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (inView && videoRef.current) {
            videoRef.current.play().catch((e) => console.log('Autoplay prevented:', e));
        }
    }, [inView]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.6, delay: (idx % 3) * 0.15, ease: "easeOut" }}
            className="relative aspect-[9/16] bg-muted/30 rounded-xl overflow-hidden shadow-xl"
        >
            {inView && (
                <video
                    ref={videoRef}
                    src={src}
                    poster={src.replace(".mp4", ".jpg")}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                />
            )}
        </motion.div>
    );
};

const VideoGallery = () => {
    return (
        <section className="bg-background py-16">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <p className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">Our Masterpieces</p>
                    <h2 className="font-heading text-3xl md:text-5xl font-light">Video Showcase</h2>
                </motion.div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {videos.map((src, idx) => (
                        <VideoItem key={idx} src={src} idx={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VideoGallery;
