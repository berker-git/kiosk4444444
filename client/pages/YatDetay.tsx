import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { yachts } from "@/components/yat/data";
import type { Yacht } from "@/components/yat/types";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  MapPin,
  Users,
  Clock,
  Ship,
  ShieldCheck,
  Info,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
  PartyPopper,
  ChefHat,
  Anchor,
  Car,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays, format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

// Embarkation points per location (extend as needed)
const ISKELELER: Record<string, { id: string; name: string }[]> = {
  Antalya: [
    { id: "setur", name: "Setur Marina" },
    { id: "oldtown", name: "Kaleiçi Marina" },
    { id: "konyaalti", name: "Konyaaltı Yat Limanı" },
  ],
  Kemer: [
    { id: "kemer", name: "Kemer Marina" },
    { id: "goynuk", name: "Göynük İskelesi" },
  ],
  "Kaş / Kalkan": [
    { id: "kas", name: "Kaş Marina" },
    { id: "kalkan", name: "Kalkan Limanı" },
  ],
  Side: [
    { id: "manavgat", name: "Manavgat Irmağı İskelesi" },
    { id: "sutlu", name: "Sütlü Marina" },
  ],
};

// Transfer price table by iskele
const TRANSFER_PRICING: Record<
  string,
  { id: string; label: string; price: number }[]
> = {
  "Setur Marina": [
    { id: "sedan", label: "Sedan (1-3)", price: 55 },
    { id: "minivan", label: "Minivan (1-6)", price: 75 },
    { id: "minibus", label: "Minibüs (1-12)", price: 120 },
  ],
  "Kaleiçi Marina": [
    { id: "sedan", label: "Sedan (1-3)", price: 45 },
    { id: "minivan", label: "Minivan (1-6)", price: 70 },
    { id: "minibus", label: "Minibüs (1-12)", price: 110 },
  ],
  "Konyaaltı Yat Limanı": [
    { id: "sedan", label: "Sedan (1-3)", price: 40 },
    { id: "minivan", label: "Minivan (1-6)", price: 65 },
    { id: "minibus", label: "Minibüs (1-12)", price: 100 },
  ],
  "Kemer Marina": [
    { id: "sedan", label: "Sedan (1-3)", price: 80 },
    { id: "minivan", label: "Minivan (1-6)", price: 110 },
    { id: "minibus", label: "Minibüs (1-12)", price: 160 },
  ],
  "Göynük İskelesi": [
    { id: "sedan", label: "Sedan (1-3)", price: 90 },
    { id: "minivan", label: "Minivan (1-6)", price: 120 },
    { id: "minibus", label: "Minibüs (1-12)", price: 170 },
  ],
  "Kaş Marina": [
    { id: "sedan", label: "Sedan (1-3)", price: 140 },
    { id: "minivan", label: "Minivan (1-6)", price: 180 },
    { id: "minibus", label: "Minibüs (1-12)", price: 240 },
  ],
  "Kalkan Limanı": [
    { id: "sedan", label: "Sedan (1-3)", price: 160 },
    { id: "minivan", label: "Minivan (1-6)", price: 200 },
    { id: "minibus", label: "Minibüs (1-12)", price: 260 },
  ],
  "Manavgat Irmağı İskelesi": [
    { id: "sedan", label: "Sedan (1-3)", price: 95 },
    { id: "minivan", label: "Minivan (1-6)", price: 125 },
    { id: "minibus", label: "Minibüs (1-12)", price: 170 },
  ],
  "Sütlü Marina": [
    { id: "sedan", label: "Sedan (1-3)", price: 100 },
    { id: "minivan", label: "Minivan (1-6)", price: 130 },
    { id: "minibus", label: "Minibüs (1-12)", price: 180 },
  ],
};

// Add-on catalog with categories
const ADDON_CATEGORIES: {
  id: string;
  label: string;
  icon: ReactNode;
  items: { id: string; name: string; price: number; emoji?: string }[];
}[] = [
  {
    id: "yemek",
    label: "Yemek",
    icon: <UtensilsCrossed className="h-4 w-4" />,
    items: [
      { id: "balik-menu", name: "Balık Menü", price: 25, emoji: "🐟" },
      { id: "et-menu", name: "Et Menü", price: 30, emoji: "🥩" },
      { id: "mezeler", name: "Meze Tabağı", price: 15, emoji: "🥗" },
      { id: "pasta", name: "Kutlama Pastası", price: 20, emoji: "🎂" },
    ],
  },
  {
    id: "organizasyon",
    label: "Organizasyon",
    icon: <PartyPopper className="h-4 w-4" />,
    items: [
      {
        id: "evlilik-teklifi",
        name: "Evlilik Teklifi Paketi",
        price: 120,
        emoji: "💍",
      },
      { id: "masa-susleme", name: "Masa Süsleme", price: 60, emoji: "🎀" },
      { id: "volkan", name: "Volkanik Karşılama", price: 45, emoji: "✨" },
    ],
  },
  {
    id: "hizmet",
    label: "Hizmet",
    icon: <ChefHat className="h-4 w-4" />,
    items: [
      { id: "prof-asci", name: "Profesyonel Aşçı", price: 80, emoji: "👨‍🍳" },
      { id: "dj", name: "DJ Hizmeti", price: 100, emoji: "🎧" },
      { id: "fotograf", name: "Fotoğraf/Video", price: 90, emoji: "📸" },
    ],
  },
];

export default function YatDetay() {
  const { id } = useParams();
  const nav = useNavigate();
  const yacht: Yacht | undefined = useMemo(
    () => yachts.find((y) => y.id === id),
    [id],
  );

  const [active, setActive] = useState(0);
  const [rentalType, setRentalType] = useState<"daily" | "hourly">("daily");
  const [guests, setGuests] = useState(4);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [startHour, setStartHour] = useState("10:00");
  const [hours, setHours] = useState(2);
  const [hourlyDate, setHourlyDate] = useState<Date | undefined>(undefined);
  const [embark, setEmbark] = useState<string | undefined>(undefined);

  // Add-ons state: key -> qty
  const [addons, setAddons] = useState<Record<string, number>>({});
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [draftAddons, setDraftAddons] = useState<Record<string, number>>({});

  // Transfer state
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);
  const [draftTransfer, setDraftTransfer] = useState<string | null>(null);

  // Video modal
  const [videoOpen, setVideoOpen] = useState(false);

  // Booking flow modal
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [bookingMode, setBookingMode] = useState<"pre" | "pay" | null>(null);

  // Booking form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  // Reviews state (client-side)
  const [reviews, setReviews] = useState<
    { name: string; text: string; rating: number }[]
  >([]);
  const [myName, setMyName] = useState("");
  const [myText, setMyText] = useState("");
  const [myRating, setMyRating] = useState(0);

  if (!yacht) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Button variant="ghost" onClick={() => nav(-1)} className="mb-4">
          <ChevronLeft className="h-4 w-4" /> Geri
        </Button>
        <p>Tekne bulunamadı.</p>
      </div>
    );
  }

  // Defaults for embarkation based on location/marina
  const iskeleOptions = ISKELELER[yacht.location] || [
    { id: "default", name: yacht.marina || yacht.location },
  ];
  const embarkName = embark
    ? iskeleOptions.find((i) => i.id === embark)?.name
    : yacht.marina || iskeleOptions[0].name;

  const dayCount =
    rentalType === "daily" && date?.from
      ? Math.max(
          1,
          differenceInCalendarDays(date?.to ?? date.from, date.from) + 1,
        )
      : 0;

  const baseSubtotal =
    rentalType === "daily" ? dayCount * yacht.price : hours * yacht.price;

  const addonsSubtotal = Object.entries(addons).reduce((sum, [id, qty]) => {
    const item = ADDON_CATEGORIES.flatMap((c) => c.items).find(
      (i) => i.id === id,
    );
    return sum + (item ? item.price * qty : 0);
    // eslint-disable-next-line no-console
  }, 0);

  const transferOptions =
    TRANSFER_PRICING[embarkName || ""] ||
    TRANSFER_PRICING[yacht.marina || ""] ||
    [];
  const transferSubtotal = (() => {
    if (!selectedTransfer) return 0;
    const opt = transferOptions.find((o) => o.id === selectedTransfer);
    return opt ? opt.price : 0;
  })();

  const grandTotal = baseSubtotal + addonsSubtotal + transferSubtotal;
  const prepay = Math.round(grandTotal * 0.3 * 100) / 100;
  const payOnBoard = Math.max(0, Math.round((grandTotal - prepay) * 100) / 100);

  const hourOptions = Array.from({ length: 13 }, (_, i) => i).filter(
    (n) => n >= 1 && n <= 12,
  );
  const startTimes = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const minHourly = 2; // min rental hours

  const submitReservation = () => {
    if (guests > yacht.capacity) {
      toast({ title: `Maksimum kapasite ${yacht.capacity} kişi` });
      return;
    }
    if (rentalType === "daily") {
      if (!date?.from) {
        toast({ title: "Lütfen tarih seçiniz" });
        return;
      }
    } else if (hours < minHourly) {
      toast({ title: `Saatlik kiralamalarda minimum ${minHourly} saat` });
      return;
    }
    toast({
      title: "Ön rezervasyon oluşturuldu",
      description: `${yacht.title} • ${rentalType === "daily" ? `${dayCount} gün` : `${hours} saat (${startHour})`} • ${guests} kişi • ${embarkName || "İskele seçilmedi"}`,
    });
  };

  const addOnQty = (id: string) => draftAddons[id] || 0;
  const setAddOnQty = (id: string, qty: number) =>
    setDraftAddons((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

  const submitReview = () => {
    if (!myName.trim() || !myText.trim() || myRating < 1) {
      toast({ title: "Lütfen ad, yorum ve yıldız veriniz" });
      return;
    }
    setReviews((r) => [
      { name: myName.trim(), text: myText.trim(), rating: myRating },
      ...r,
    ]);
    setMyName("");
    setMyText("");
    setMyRating(0);
    toast({ title: "Teşekkürler", description: "Yorumunuz kaydedildi" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-6 md:py-10">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)}>
          <ChevronLeft className="h-4 w-4" /> Geri
        </Button>
        <div className="text-sm text-slate-500 flex items-center gap-2">
          <MapPin className="h-4 w-4" /> {yacht.marina || yacht.location}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Left: Gallery + Details */}
        <div className="md:col-span-3">
          <div className="overflow-hidden rounded-xl border bg-white/80 dark:bg-white/5 backdrop-blur-xl relative">
            <div className="aspect-[16/10] w-full overflow-hidden">
              <img
                src={(yacht.images && yacht.images[active]) || yacht.image}
                alt={yacht.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end justify-end p-3">
                <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary">
                      Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Tanıtım Videosu</DialogTitle>
                    </DialogHeader>
                    {(yacht as any).video ? (
                      <video controls className="w-full rounded-md">
                        <source src={(yacht as any).video} />
                      </video>
                    ) : (
                      <div className="text-sm text-slate-500">
                        Bu tekne için video henüz eklenmedi.
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {yacht.images && yacht.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-2">
                {yacht.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`overflow-hidden rounded-md border ${active === i ? "ring-2 ring-brand" : ""}`}
                    aria-label={`${yacht.title} ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${yacht.title} ${i + 1}`}
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border bg-white/80 dark:bg-white/5 backdrop-blur-xl p-4 md:p-6">
            <div className="flex items-center gap-2 text-brand">
              <Ship className="h-4 w-4" />
              <span className="text-xs">
                Bu tekne günlük ve saatlik kiralamaya uygundur.
              </span>
            </div>

            <h1 className="mt-2 text-2xl md:text-3xl font-bold">
              {yacht.title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {yacht.description}
            </p>

            {/* Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border px-3 py-1 bg-white/70 dark:bg-white/5">
                Min kiralama: {minHourly} saat
              </span>
              <span className="rounded-full border px-3 py-1 bg-white/70 dark:bg-white/5">
                Max kapasite: {yacht.capacity}
              </span>
              <span className="rounded-full border px-3 py-1 bg-white/70 dark:bg-white/5">
                Akşam yemeği kapasite: {yacht.capacity}
              </span>
            </div>

            {/* Free cancellation */}
            <div className="mt-3 rounded-md border bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200 px-3 py-2 text-xs flex items-center gap-2">
              <Info className="h-4 w-4" /> Turdan 3 gün öncesine kadar ücretsiz
              iptal.
            </div>

            {/* Highlights with icons */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Feature
                icon={<Anchor className="h-4 w-4" />}
                text="Kaptanlı Kiralama"
              />
              <Feature
                icon={<ChefHat className="h-4 w-4" />}
                text="Profesyonel Aşçı"
              />
              <Feature
                icon={<Users className="h-4 w-4" />}
                text="Mürettebatlı Kiralama"
              />
            </div>

            {/* Terms + Sections Tabs */}
            <Tabs defaultValue="genel" className="mt-6">
              <TabsList className="w-full grid grid-cols-4 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                <TabsTrigger
                  value="genel"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md"
                >
                  Genel
                </TabsTrigger>
                <TabsTrigger
                  value="teknik"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md"
                >
                  Teknik
                </TabsTrigger>
                <TabsTrigger
                  value="ozellikler"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md"
                >
                  Özellikler
                </TabsTrigger>
                <TabsTrigger
                  value="harita"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md"
                >
                  Harita
                </TabsTrigger>
              </TabsList>

              <TabsContent value="genel">
                {/* Hourly terms style list */}
                <SectionTitle
                  icon={<Info className="h-4 w-4" />}
                  title="Saatlik Şartlar"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <Term
                    ok
                    text="Kavga durumunda tur bitirilir ve tüm tutar talep edilir."
                  />
                  <Term ok text="Masa ve sandalyeler fiyata dahildir." />
                  <Term ok text="Ses sistemi var ve kullanılabilir." />
                </div>

                <SectionTitle
                  icon={<UtensilsCrossed className="h-4 w-4" />}
                  title="Teknede Sunulan İmkanlar"
                />
                <TagGrid
                  items={(yacht.amenities || []).map((a) => amenityLabel(a))}
                />

                <SectionTitle
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Güvenlik Ekipmanları"
                />
                <TagGrid
                  items={[
                    "Can Yeleği",
                    "Can Simidi",
                    "İlk Yardım Malzemeleri",
                    "Yangın Söndürücüler",
                    "Can Kurtarma Halatı",
                  ]}
                />

                <SectionTitle
                  icon={<Info className="h-4 w-4" />}
                  title="Tekne Prosedürleri"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <Term
                    ok
                    text="Tekneye yiyecek/içecek getirme için kaptanla teyit gerekir."
                  />
                  <Term ok text="Yakıt ve standart rotalar fiyata dahildir." />
                  <Term
                    ok
                    text="Hava koşullarına bağlı rota değişikliği yapılabilir."
                  />
                </div>
              </TabsContent>

              <TabsContent value="teknik">
                <div className="mt-4 rounded-lg border bg-white/70 dark:bg-white/5">
                  <Table>
                    <TableBody>
                      {yacht.specs?.length && (
                        <InfoRow label="Uzunluk" value={yacht.specs.length} />
                      )}
                      {yacht.specs?.width && (
                        <InfoRow label="Genişlik" value={yacht.specs.width} />
                      )}
                      {typeof yacht.specs?.cabins === "number" && (
                        <InfoRow
                          label="Kabin"
                          value={`${yacht.specs.cabins}`}
                        />
                      )}
                      {typeof yacht.specs?.wc === "number" && (
                        <InfoRow label="WC" value={`${yacht.specs.wc}`} />
                      )}
                      {typeof yacht.specs?.crew === "number" && (
                        <InfoRow
                          label="Mürettebat"
                          value={`${yacht.specs.crew}`}
                        />
                      )}
                      {yacht.specs?.speed && (
                        <InfoRow label="Hız" value={yacht.specs.speed} />
                      )}
                      {yacht.specs?.buildYear && (
                        <InfoRow
                          label="Yapım Yılı"
                          value={`${yacht.specs.buildYear}`}
                        />
                      )}
                      <InfoRow
                        label="Kapasite"
                        value={`${yacht.capacity} kişi`}
                      />
                      {yacht.marina && (
                        <InfoRow label="Marina" value={yacht.marina} />
                      )}
                      <InfoRow label="Bölge" value={yacht.location} />
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="ozellikler">
                {yacht.amenities && yacht.amenities.length > 0 ? (
                  <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                    {yacht.amenities.map((a) => (
                      <li
                        key={a}
                        className="rounded-md border px-3 py-2 bg-white/70 dark:bg-white/5 flex items-center gap-2"
                      >
                        {amenityIcon(a)}
                        <span>{amenityLabel(a)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Özellik bilgisi bulunmuyor.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="harita">
                {yacht.coords ? (
                  <iframe
                    title="map"
                    className="mt-4 h-64 w-full rounded-xl border"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${yacht.coords.lng - 0.02}%2C${yacht.coords.lat - 0.02}%2C${yacht.coords.lng + 0.02}%2C${yacht.coords.lat + 0.02}&layer=mapnik&marker=${yacht.coords.lat}%2C${yacht.coords.lng}`}
                  />
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Harita bilgisi yok.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Reviews */}
          <div className="mt-6 rounded-xl border bg-white/80 dark:bg-white/5 backdrop-blur-xl p-4 md:p-6">
            <h2 className="text-lg font-semibold">Misafir Yorumları</h2>
            <div className="mt-3 grid gap-3">
              <div className="grid grid-cols-1 md:grid-cols-[160px,1fr,140px] gap-3 items-end">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">
                    Adınız
                  </label>
                  <Input
                    value={myName}
                    onChange={(e) => setMyName(e.target.value)}
                    placeholder="Ad Soyad"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">
                    Yorumunuz
                  </label>
                  <Input
                    value={myText}
                    onChange={(e) => setMyText(e.target.value)}
                    placeholder="Harikaydı..."
                  />
                </div>
                <div className="flex md:justify-end">
                  <StarRating value={myRating} onChange={setMyRating} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  İskele: {embarkName || "Seçilmedi"}
                </div>
                <Button onClick={submitReview}>Yorumu Gönder</Button>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              {reviews.length === 0 && (
                <div className="text-sm text-slate-500">Henüz yorum yok.</div>
              )}
              {reviews.map((r, i) => (
                <div key={i} className="rounded-md border px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.name}</div>
                    <StarRating value={r.rating} readOnly />
                  </div>
                  <div className="text-sm mt-1">{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Panel */}
        <div className="md:col-span-2">
          <div className="sticky top-4 rounded-xl border bg-white/80 dark:bg-white/5 backdrop-blur-xl p-4 md:p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {yacht.price} {yacht.currency || "€"}
                </div>
                <div className="text-xs text-slate-500">
                  {rentalType === "daily" ? "/ gün" : "/ saat"}
                </div>
              </div>
              <ToggleGroup
                type="single"
                value={rentalType}
                onValueChange={(v) => v && setRentalType(v as any)}
              >
                <ToggleGroupItem
                  value="daily"
                  className="data-[state=on]:bg-accent"
                >
                  Günlük
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="hourly"
                  className="data-[state=on]:bg-accent"
                >
                  Saatlik
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="mt-4 space-y-3">
              {/* Region */}
              <div>
                <label className="mb-1 block text-xs font-medium">Bölge</label>
                <Select defaultValue={yacht.location}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={yacht.location}>
                      {yacht.location}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date or Hourly */}
              {rentalType === "daily" ? (
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Tarih
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <span>
                              {format(date.from, "dd.MM.yyyy")} -{" "}
                              {format(date.to, "dd.MM.yyyy")}
                            </span>
                          ) : (
                            <span>{format(date.from, "dd.MM.yyyy")}</span>
                          )
                        ) : (
                          <span>Tarih seçiniz</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  {dayCount > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Seçilen süre: {dayCount} gün
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Tarih
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {hourlyDate ? (
                            <span>{format(hourlyDate, "dd.MM.yyyy")}</span>
                          ) : (
                            <span>Tarih seçiniz</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={hourlyDate}
                          onSelect={setHourlyDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Başlangıç
                      </label>
                      <div className="relative">
                        <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                        <Select value={startHour} onValueChange={setStartHour}>
                          <SelectTrigger className="pl-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {startTimes.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Süre (saat)
                      </label>
                      <Select
                        value={String(hours)}
                        onValueChange={(v) => setHours(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {hourOptions.map((h) => (
                            <SelectItem key={h} value={String(h)}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Minimum {minHourly} saat
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guests */}
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Kişi Sayısı
                </label>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                  <Input
                    type="number"
                    min={1}
                    max={yacht.capacity}
                    value={guests}
                    onChange={(e) =>
                      setGuests(Math.max(1, Number(e.target.value)))
                    }
                    className="pl-9"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Maksimum {yacht.capacity} kişi
                </p>
              </div>

              {/* Embarkation selection */}
              <div>
                <label className="mb-1 block text-xs font-medium">İskele</label>
                <RadioGroup
                  value={embark || iskeleOptions[0].id}
                  onValueChange={setEmbark}
                  className="grid gap-2"
                >
                  {iskeleOptions.map((i) => (
                    <label
                      key={i.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <RadioGroupItem value={i.id} />
                      <span className="flex items-center gap-2">
                        <Anchor className="h-4 w-4 text-brand" />
                        {i.name}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Add-ons & Transfer Buttons */}
              <div className="flex flex-wrap gap-2">
                <Dialog
                  open={addonsOpen}
                  onOpenChange={(o) => {
                    setAddonsOpen(o);
                    if (o) {
                      setDraftAddons(addons);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <UtensilsCrossed className="h-4 w-4" /> Yemek ve Hizmet
                      Seçenekleri
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Ek Hizmetler</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue={ADDON_CATEGORIES[0].id}>
                      <TabsList className="flex flex-wrap">
                        {ADDON_CATEGORIES.map((c) => (
                          <TabsTrigger
                            key={c.id}
                            value={c.id}
                            className="flex items-center gap-2"
                          >
                            {c.icon}
                            {c.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {ADDON_CATEGORIES.map((c) => (
                        <TabsContent key={c.id} value={c.id}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            {c.items.map((it) => (
                              <div
                                key={it.id}
                                className="rounded-md border p-3 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xl leading-none">
                                    {it.emoji || ""}
                                  </span>
                                  <div>
                                    <div className="font-medium">{it.name}</div>
                                    <div className="text-xs text-slate-500">
                                      {it.price} {yacht.currency || "€"}
                                    </div>
                                  </div>
                                </div>
                                <Qty
                                  value={addOnQty(it.id)}
                                  onChange={(q) => setAddOnQty(it.id, q)}
                                />
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                    <div className="mt-3 text-sm flex items-center justify-between">
                      <div>Ek hizmetler tutarı</div>
                      <div className="font-semibold">
                        {Object.entries(draftAddons).reduce((s, [id, q]) => {
                          const it = ADDON_CATEGORIES.flatMap(
                            (c) => c.items,
                          ).find((i) => i.id === id);
                          return s + (it ? it.price * q : 0);
                        }, 0)}{" "}
                        {yacht.currency || "€"}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setAddonsOpen(false)}
                      >
                        İptal
                      </Button>
                      <Button
                        onClick={() => {
                          setAddons(draftAddons);
                          setAddonsOpen(false);
                        }}
                      >
                        Onayla
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={transferOpen}
                  onOpenChange={(o) => {
                    setTransferOpen(o);
                    if (o) {
                      setDraftTransfer(selectedTransfer);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Car className="h-4 w-4" /> Transfer Hizmeti
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Transfer Seçenekleri ({embarkName || yacht.marina})
                      </DialogTitle>
                    </DialogHeader>
                    {transferOptions.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        Bu iskele için transfer verisi bulunmuyor.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transferOptions.map((t) => (
                          <label
                            key={t.id}
                            className={`flex items-center justify-between rounded-md border px-3 py-2 ${selectedTransfer === t.id ? "ring-2 ring-brand" : ""}`}
                          >
                            <span className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-brand" /> {t.label}
                            </span>
                            <span className="text-sm font-medium">
                              {t.price} {yacht.currency || "€"}
                            </span>
                            <input
                              type="radio"
                              name="transfer"
                              value={t.id}
                              checked={selectedTransfer === t.id}
                              onChange={() => setSelectedTransfer(t.id)}
                              className="sr-only"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 text-sm flex items-center justify-between">
                      <div>Transfer tutarı</div>
                      <div className="font-semibold">
                        {transferSubtotal} {yacht.currency || "€"}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Price breakdown */}
              <div className="rounded-lg border bg-white/70 dark:bg-white/5 p-3 text-sm space-y-1.5">
                {rentalType === "hourly" && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Saatlik hesap</span>
                    <span>
                      {yacht.price} × {hours} = <b>{hours * yacht.price}</b>{" "}
                      {yacht.currency || "€"}
                    </span>
                  </div>
                )}
                {rentalType === "daily" && dayCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Günlük hesap</span>
                    <span>
                      {yacht.price} × {dayCount} ={" "}
                      <b>{dayCount * yacht.price}</b> {yacht.currency || "€"}
                    </span>
                  </div>
                )}
                <Row
                  label="Ara toplam"
                  value={baseSubtotal}
                  currency={yacht.currency}
                />
                <Row
                  label="Ek hizmetler"
                  value={addonsSubtotal}
                  currency={yacht.currency}
                />
                <Row
                  label="Transfer"
                  value={transferSubtotal}
                  currency={yacht.currency}
                />
                <Separator className="my-1" />
                <Row
                  label="Toplam"
                  value={grandTotal}
                  currency={yacht.currency}
                  bold
                />
                <Row
                  label="Online ön ödeme (30%)"
                  value={prepay}
                  currency={yacht.currency}
                />
                <Row
                  label="Tekneye ödenecek"
                  value={payOnBoard}
                  currency={yacht.currency}
                />
              </div>

              <Button className="w-full" onClick={submitReservation}>
                Rezervasyon Talebi Gönder
              </Button>
              <p className="text-xs text-slate-500">
                Talebiniz bize iletilir ve en kısa sürede dönüş yapılır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-white/70 dark:bg-white/5 px-3 py-2">
      <span className="text-brand">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function SectionTitle({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mt-6 mb-2 flex items-center gap-2">
      {icon}
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function Term({ ok, text }: { ok?: boolean; text: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-3 py-2 ${ok ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}
    >
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600" />
      )}
      <span className="text-sm">{text}</span>
    </div>
  );
}

function TagGrid({ items }: { items: string[] }) {
  return (
    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
      {items.map((t) => (
        <div
          key={t}
          className="rounded-md border px-3 py-2 bg-white/70 dark:bg-white/5 flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}

function Spec({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-md border bg-white/70 dark:bg-white/5 p-3 text-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <TableRow>
      <TableCell className="w-1/3 text-slate-500">{label}</TableCell>
      <TableCell className="font-medium">{value}</TableCell>
    </TableRow>
  );
}

function Row({
  label,
  value,
  currency,
  bold,
}: {
  label: string;
  value: number;
  currency?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600 text-sm">{label}</span>
      <span className={bold ? "font-bold" : "font-medium"}>
        {value} {currency || "€"}
      </span>
    </div>
  );
}

function StarRating({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={`p-1 ${readOnly ? "cursor-default" : "hover:scale-110"}`}
          onClick={() => !readOnly && onChange && onChange(i)}
          aria-label={`${i} yıldız`}
        >
          <Star
            className={`h-5 w-5 ${i <= value ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}`}
          />
        </button>
      ))}
    </div>
  );
}

function Qty({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        -
      </Button>
      <Input
        className="w-14 text-center"
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      />
      <Button type="button" size="sm" onClick={() => onChange(value + 1)}>
        +
      </Button>
    </div>
  );
}

function amenityLabel(id: string) {
  switch (id) {
    case "wc":
      return "WC";
    case "wifi":
      return "Wi‑Fi";
    case "kitchen":
      return "Mutfak";
    case "sound":
      return "Ses Sistemi";
    case "captain":
      return "Kaptan";
    case "discount":
      return "İndirim";
    default:
      return id;
  }
}

function amenityIcon(id: string) {
  switch (id) {
    case "wc":
      return <Info className="h-4 w-4" />;
    case "wifi":
      return <Info className="h-4 w-4" />;
    case "kitchen":
      return <ChefHat className="h-4 w-4" />;
    case "sound":
      return <PartyPopper className="h-4 w-4" />;
    case "captain":
      return <Ship className="h-4 w-4" />;
    case "discount":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}
