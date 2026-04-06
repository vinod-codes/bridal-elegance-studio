import { Star } from "lucide-react";

const reviews = [
    {
        id: 1,
        name: "Priyanka S.",
        date: "2 months ago",
        text: "Absolutely stunning bridal set! The handcrafted details made my wedding day so special. Highly recommended for authentic, elegant jewelry.",
        rating: 5,
    },
    {
        id: 2,
        name: "Anjali K.",
        date: "4 months ago",
        text: "Ordered a custom Haldi jewelry set and it was beyond my expectations. The quality of the materials and the design were perfect.",
        rating: 5,
    },
    {
        id: 3,
        name: "Meera R.",
        date: "5 months ago",
        text: "Unique Jewelry Studio has the best collection for Mehndi. The customer service was excellent, and the product arrived right on time.",
        rating: 5,
    },
];

const GoogleReviews = () => {
    return (
        <section className="bg-muted py-16">
            <div className="container">
                <div className="text-center mb-10">
                    <p className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">Testimonials</p>
                    <h2 className="font-heading text-3xl md:text-4xl font-medium">What Our Brides Say</h2>
                    <div className="flex items-center justify-center gap-1 mt-4">
                        <span className="font-medium mr-2 text-xl">5.0</span>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-[#FABB05] text-[#FABB05]" />
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">Google Reviews</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-background p-6 rounded-lg shadow-sm border border-border">
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-[#FABB05] text-[#FABB05]" />
                                ))}
                            </div>
                            <p className="font-body text-sm text-foreground mb-4 italic">"{review.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center font-heading text-gold font-medium">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm font-body">{review.name}</h4>
                                    <p className="text-xs text-muted-foreground">{review.date}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GoogleReviews;
