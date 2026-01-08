import { Button } from "@/components/ui/button"

const artists = [
  {
    name: "Emma Rodriguez",
    style: "Portraits",
    startingPrice: "$75",
    avatar: "/woman-artist-portrait-warm.jpg",
  },
  {
    name: "James Chen",
    style: "Digital Art",
    startingPrice: "$50",
    avatar: "/man-creative-artist-portrait.jpg",
  },
  {
    name: "Sophie Williams",
    style: "Crafts",
    startingPrice: "$40",
    avatar: "/woman-crafter-artist-smiling.jpg",
  },
  {
    name: "Marcus Johnson",
    style: "Calligraphy",
    startingPrice: "$35",
    avatar: "/man-calligrapher-artist-portrait.jpg",
  },
]

export function ArtistShowcase() {
  return (
    <section id="artists" className="bg-secondary/50 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl text-foreground md:text-4xl text-balance">Meet Our Artists</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Talented creators ready to bring your vision to life
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {artists.map((artist) => (
            <div
              key={artist.name}
              className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md"
            >
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full bg-muted">
                <img
                  src={artist.avatar || "/placeholder.svg"}
                  alt={artist.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">{artist.name}</h3>
              <p className="mb-2 text-sm text-muted-foreground">{artist.style}</p>
              <p className="mb-4 text-sm font-medium text-primary">From {artist.startingPrice}</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View Profile
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
