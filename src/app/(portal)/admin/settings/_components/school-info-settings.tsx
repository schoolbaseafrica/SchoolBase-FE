"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { useSchoolStore } from "@/store/use-school-store"

interface SchoolData {
  id: string
  name: string
  address?: string
  email?: string
  phone?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  installation_completed: boolean
  activity_log_retention_days?: number | null
  // ID Format Configuration
  school_code?: string
  student_id_format?: string
  student_id_prefix?: string
  allow_manual_student_ids?: boolean
  teacher_id_format?: string
  teacher_id_prefix?: string
  allow_manual_teacher_ids?: boolean
  parent_id_format?: string
  parent_id_prefix?: string
  allow_manual_parent_ids?: boolean
  staff_id_format?: string
  staff_id_prefix?: string
  allow_manual_staff_ids?: boolean
}

// African countries with their states/provinces/regions
const AFRICAN_COUNTRIES: Record<string, string[]> = {
  Nigeria: [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ],
  "South Africa": [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
    "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ],
  Kenya: [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
    "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
    "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
    "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
    "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
    "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
    "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
  ],
  Ghana: [
    "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra",
    "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West",
    "Volta", "Western", "Western North"
  ],
  Ethiopia: [
    "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela",
    "Harari", "Oromia", "Somali", "SNNPR", "Tigray"
  ],
  Tanzania: [
    "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi",
    "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara", "Mbeya", "Mjini Magharibi",
    "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North", "Pemba South",
    "Pwani", "Rukwa", "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Songwe",
    "Tabora", "Tanga", "Unguja North", "Unguja South"
  ],
  Uganda: [
    "Abim", "Adjumani", "Agago", "Alebtong", "Amolatar", "Amudat", "Amuria",
    "Amuru", "Apac", "Arua", "Budaka", "Bududa", "Bugiri", "Buhweju", "Buikwe",
    "Bukedea", "Bukomansimbi", "Bukwo", "Bulambuli", "Buliisa", "Bundibugyo",
    "Bushenyi", "Busia", "Butaleja", "Butambala", "Butebo", "Buvuma", "Buyende",
    "Central", "Eastern", "Northern", "Western"
  ],
  "Côte d'Ivoire": [
    "Bas-Sassandra", "Comoé", "Denguélé", "Gôh-Djiboua", "Lacs", "Lagunes",
    "Montagnes", "Sassandra-Marahoué", "Savanes", "Vallée du Bandama", "Woroba",
    "Yamoussoukro", "Zanzan"
  ],
  "DR Congo": [
    "Bas-Uele", "Équateur", "Haut-Katanga", "Haut-Lomami", "Haut-Uele", "Ituri",
    "Kasaï", "Kasaï-Central", "Kasaï-Oriental", "Kinshasa", "Kongo-Central",
    "Kwango", "Kwilu", "Lomami", "Lualaba", "Mai-Ndombe", "Maniema", "Mongala",
    "Nord-Kivu", "Nord-Ubangi", "Sankuru", "Sud-Kivu", "Sud-Ubangi", "Tanganyika",
    "Tshopo", "Tshuapa"
  ],
  Cameroon: [
    "Adamawa", "Centre", "East", "Far North", "Littoral", "North", "Northwest",
    "South", "Southwest", "West"
  ],
  Senegal: [
    "Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", "Kolda",
    "Louga", "Matam", "Saint-Louis", "Sédhiou", "Tambacounda", "Thiès", "Ziguinchor"
  ],
  Morocco: [
    "Casablanca-Settat", "Drâa-Tafilalet", "Fès-Meknès", "Guelmim-Oued Noun",
    "Laâyoune-Sakia El Hamra", "Marrakech-Safi", "Oriental", "Rabat-Salé-Kénitra",
    "Souss-Massa", "Tanger-Tétouan-Al Hoceïma"
  ],
  Algeria: [
    "Adrar", "Aïn Defla", "Aïn Témouchent", "Algiers", "Annaba", "Batna", "Béchar",
    "Béjaïa", "Biskra", "Blida", "Bordj Bou Arréridj", "Bouira", "Boumerdès",
    "Chlef", "Constantine", "Djelfa", "El Bayadh", "El Oued", "El Tarf", "Ghardaïa",
    "Guelma", "Illizi", "Jijel", "Khenchela", "Laghouat", "Mascara", "Médéa",
    "Mila", "Mostaganem", "M'Sila", "Naâma", "Oran", "Ouargla", "Oum El Bouaghi",
    "Relizane", "Saïda", "Sétif", "Sidi Bel Abbès", "Skikda", "Souk Ahras",
    "Tamanghasset", "Tébessa", "Tiaret", "Tindouf", "Tipaza", "Tissemsilt",
    "Tizi Ouzou", "Tlemcen"
  ],
  Angola: [
    "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte",
    "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Luanda", "Lunda Norte", "Lunda Sul",
    "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"
  ],
  Mozambique: [
    "Cabo Delgado", "Gaza", "Inhambane", "Manica", "Maputo", "Maputo City",
    "Nampula", "Niassa", "Sofala", "Tete", "Zambézia"
  ],
  Madagascar: [
    "Antananarivo", "Antsiranana", "Fianarantsoa", "Mahajanga", "Toamasina", "Toliara"
  ],
  Mali: [
    "Bamako", "Gao", "Kayes", "Kidal", "Koulikoro", "Ménaka", "Mopti", "Ségou",
    "Sikasso", "Taoudénit", "Tombouctou"
  ],
  Burkina_Faso: [
    "Boucle du Mouhoun", "Cascades", "Centre", "Centre-Est", "Centre-Nord",
    "Centre-Ouest", "Centre-Sud", "Est", "Hauts-Bassins", "Nord", "Plateau-Central",
    "Sahel", "Sud-Ouest"
  ],
  Niger: [
    "Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder"
  ],
  Chad: [
    "Bahr el Gazel", "Batha", "Borkou", "Chari-Baguirmi", "Ennedi-Est", "Ennedi-Ouest",
    "Guéra", "Hadjer-Lamis", "Kanem", "Lac", "Logone Occidental", "Logone Oriental",
    "Mandoul", "Mayo-Kebbi Est", "Mayo-Kebbi Ouest", "Moyen-Chari", "N'Djamena",
    "Ouaddaï", "Salamat", "Sila", "Tandjilé", "Tibesti", "Wadi Fira"
  ],
  Sudan: [
    "Al Jazirah", "Blue Nile", "Central Darfur", "East Darfur", "Gedaref", "Kassala",
    "Khartoum", "North Darfur", "North Kordofan", "Northern", "Red Sea", "River Nile",
    "Sennar", "South Darfur", "South Kordofan", "West Darfur", "West Kordofan",
    "White Nile"
  ],
  Tunisia: [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
    "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine",
    "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine",
    "Tozeur", "Tunis", "Zaghouan"
  ],
  Libya: [
    "Al Butnan", "Al Jabal al Akhdar", "Al Jabal al Gharbi", "Al Jafarah",
    "Al Jufrah", "Al Kufrah", "Al Marj", "Al Marqab", "Al Wahat", "An Nuqat al Khams",
    "Az Zawiyah", "Benghazi", "Darnah", "Ghat", "Misratah", "Murzuq", "Nalut",
    "Sabha", "Surt", "Tarabulus", "Wadi al Hayat", "Wadi ash Shati'"
  ],
  Egypt: [
    "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia",
    "Damietta", "Faiyum", "Gharbia", "Giza", "Ismailia", "Kafr El Sheikh",
    "Luxor", "Matruh", "Minya", "Monufia", "New Valley", "North Sinai", "Port Said",
    "Qalyubia", "Qena", "Red Sea", "Sharqia", "Sohag", "South Sinai", "Suez"
  ],
  Zimbabwe: [
    "Bulawayo", "Harare", "Manicaland", "Mashonaland Central", "Mashonaland East",
    "Mashonaland West", "Masvingo", "Matabeleland North", "Matabeleland South",
    "Midlands"
  ],
  Zambia: [
    "Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga", "Northern",
    "North-Western", "Southern", "Western"
  ],
  Malawi: [
    "Central Region", "Northern Region", "Southern Region"
  ],
  Botswana: [
    "Central", "Ghanzi", "Kgalagadi", "Kgatleng", "Kweneng", "North East",
    "North West", "South East", "Southern"
  ],
  Namibia: [
    "Erongo", "Hardap", "//Karas", "Kavango East", "Kavango West", "Khomas",
    "Kunene", "Ohangwena", "Omaheke", "Omusati", "Oshana", "Oshikoto", "Otjozondjupa",
    "Zambezi"
  ],
  Rwanda: [
    "Eastern", "Kigali", "Northern", "Southern", "Western"
  ],
  Burundi: [
    "Bubanza", "Bujumbura Mairie", "Bujumbura Rural", "Bururi", "Cankuzo", "Cibitoke",
    "Gitega", "Karuzi", "Kayanza", "Kirundo", "Makamba", "Muramvya", "Muyinga",
    "Mwaro", "Ngozi", "Rumonge", "Rutana", "Ruyigi"
  ],
  "Cape Verde": [
    "Barlavento Islands", "Sotavento Islands"
  ],
  "São Tomé and Príncipe": [
    "Príncipe", "São Tomé"
  ],
  "Equatorial Guinea": [
    "Annobón", "Bioko Norte", "Bioko Sur", "Centro Sur", "Kié-Ntem", "Litoral",
    "Wele-Nzas"
  ],
  Gabon: [
    "Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo",
    "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem"
  ],
  "Republic of the Congo": [
    "Bouenza", "Brazzaville", "Cuvette", "Cuvette-Ouest", "Kouilou", "Lékoumou",
    "Likouala", "Niari", "Plateaux", "Pointe-Noire", "Pool", "Sangha"
  ],
  "Central African Republic": [
    "Bamingui-Bangoran", "Bangui", "Basse-Kotto", "Haute-Kotto", "Haut-Mbomou",
    "Kémo", "Lobaye", "Mambéré-Kadéï", "Mbomou", "Nana-Grébizi", "Nana-Mambéré",
    "Ombella-M'Poko", "Ouaka", "Ouham", "Ouham-Pendé", "Sangha-Mbaéré", "Vakaga"
  ],
  Togo: [
    "Centrale", "Kara", "Maritime", "Plateaux", "Savanes"
  ],
  Benin: [
    "Alibori", "Atakora", "Atlantique", "Borgou", "Collines", "Couffo", "Donga",
    "Littoral", "Mono", "Ouémé", "Plateau", "Zou"
  ],
  Guinea: [
    "Boké", "Conakry", "Faranah", "Kankan", "Kindia", "Labé", "Mamou", "Nzérékoré"
  ],
  "Sierra Leone": [
    "Eastern", "Northern", "North West", "Southern", "Western Area"
  ],
  Liberia: [
    "Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount", "Grand Gedeh",
    "Grand Kru", "Lofa", "Margibi", "Maryland", "Montserrado", "Nimba", "River Cess",
    "River Gee", "Sinoe"
  ],
  "Guinea-Bissau": [
    "Bafatá", "Biombo", "Bissau", "Bolama", "Cacheu", "Gabú", "Oio", "Quinara", "Tombali"
  ],
  Gambia: [
    "Banjul", "Central River", "Lower River", "North Bank", "Upper River", "West Coast"
  ],
  Mauritania: [
    "Adrar", "Assaba", "Brakna", "Dakhlet Nouadhibou", "Gorgol", "Guidimaka",
    "Hodh Ech Chargui", "Hodh El Gharbi", "Inchiri", "Nouakchott Nord", "Nouakchott Ouest",
    "Nouakchott Sud", "Tagant", "Tiris Zemmour", "Trarza"
  ],
  Eritrea: [
    "Anseba", "Debub", "Debubawi K'eyih Bahri", "Gash-Barka", "Ma'akel", "Semenawi K'eyih Bahri"
  ],
  Djibouti: [
    "Ali Sabieh", "Arta", "Dikhil", "Djibouti", "Obock", "Tadjourah"
  ],
  Somalia: [
    "Awdal", "Bakool", "Banaadir", "Bari", "Bay", "Galguduud", "Gedo", "Hiiraan",
    "Jubbada Dhexe", "Jubbada Hoose", "Mudug", "Nugaal", "Sanaag", "Shabeellaha Dhexe",
    "Shabeellaha Hoose", "Sool", "Togdheer", "Woqooyi Galbeed"
  ],
  "South Sudan": [
    "Central Equatoria", "Eastern Equatoria", "Jonglei", "Lakes", "Northern Bahr el Ghazal",
    "Unity", "Upper Nile", "Warrap", "Western Bahr el Ghazal", "Western Equatoria"
  ],
  Comoros: [
    "Anjouan", "Grande Comore", "Mohéli"
  ],
  Mauritius: [
    "Agalega Islands", "Black River", "Flacq", "Grand Port", "Moka", "Pamplemousses",
    "Plaines Wilhems", "Port Louis", "Rivière du Rempart", "Rodrigues", "Savanne"
  ],
  Seychelles: [
    "Anse aux Pins", "Anse Boileau", "Anse Etoile", "Anse Royale", "Anse Volbert",
    "Au Cap", "Baie Lazare", "Baie Sainte Anne", "Beau Vallon", "Bel Air", "Bel Ombre",
    "Cascade", "Glacis", "Grand'Anse", "Grand'Anse", "La Digue", "La Rivière Anglaise",
    "Les Mamelles", "Mont Buxton", "Mont Fleuri", "Plaisance", "Pointe La Rue",
    "Port Glaud", "Roche Caiman", "Saint Louis", "Takamaka"
  ],
  Lesotho: [
    "Berea", "Butha-Buthe", "Leribe", "Mafeteng", "Maseru", "Mohale's Hoek",
    "Mokhotlong", "Qacha's Nek", "Quthing", "Thaba-Tseka"
  ],
  Eswatini: [
    "Hhohho", "Lubombo", "Manzini", "Shiselweni"
  ],
}

// Get states for a country
const getStatesForCountry = (country: string): string[] => {
  return AFRICAN_COUNTRIES[country] || []
}

export const SchoolInfoSettings = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { loadConfig, school } = useSchoolStore()

  const [formData, setFormData] = useState({
    schoolName: "",
    primaryColor: "#DA3743",
    secondaryColor: "",
    accentColor: "",
    phone: "",
    country: "Nigeria",
    state: "",
    city: "",
    streetAddress: "",
    email: "",
    activityLogRetentionDays: null as number | null,
    // ID Format Configuration
    schoolCode: "",
    studentIdFormat: "",
    studentIdPrefix: "STU",
    allowManualStudentIds: true,
    teacherIdFormat: "",
    teacherIdPrefix: "EMP",
    allowManualTeacherIds: true,
    parentIdFormat: "",
    parentIdPrefix: "PAR",
    allowManualParentIds: true,
    staffIdFormat: "",
    staffIdPrefix: "STF",
    allowManualStaffIds: true,
  })

  // Predefined color palette for quick selection - modern, professional colors
  const predefinedColors = [
    { name: "Crimson Red", value: "#DC2626" },
    { name: "Royal Blue", value: "#1E40AF" },
    { name: "Forest Green", value: "#166534" },
    { name: "Deep Purple", value: "#7C3AED" },
    { name: "Vibrant Orange", value: "#EA580C" },
    { name: "Ocean Teal", value: "#0D9488" },
    { name: "Magenta", value: "#C026D3" },
    { name: "Navy Blue", value: "#1E3A8A" },
    { name: "Emerald", value: "#047857" },
    { name: "Amber Gold", value: "#D97706" },
    { name: "Rose Pink", value: "#DB2777" },
    { name: "Sky Blue", value: "#0284C7" },
    { name: "Lime Green", value: "#65A30D" },
    { name: "Violet", value: "#9333EA" },
    { name: "Coral", value: "#F97316" },
    { name: "Turquoise", value: "#0891B2" },
  ]

  // Load current school data on mount
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        setIsLoading(true)
        // Use proxy route to dynamically construct backend URL from request headers
        // This ensures we always call the correct school's backend API
        const response = await fetch("/api/proxy-auth/school", {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch school data: ${response.statusText}`)
        }

        const responseData = await response.json()
        // Handle wrapped response: {status_code, message, data} or direct data
        const schoolData = responseData?.data || responseData

        if (schoolData && typeof schoolData === "object") {
          // Parse existing address if it exists
          // Format: "Street Address, City, State, Country" or just "Street Address"
          const address = schoolData.address || ""
          let parsedCountry = "Nigeria"
          let parsedState = ""
          let parsedCity = ""
          let parsedStreet = address

          // Try to parse address if it contains commas
          if (address.includes(",")) {
            const parts = address.split(",").map((p: string) => p.trim())
            if (parts.length >= 2) {
              parsedStreet = parts[0] || ""
              parsedCity = parts[1] || ""
              if (parts.length >= 3) {
                parsedState = parts[2] || ""
              }
              if (parts.length >= 4) {
                parsedCountry = parts[3] || "Nigeria"
              }
            }
          }

          setFormData({
            schoolName: schoolData.name || "",
            primaryColor: schoolData.primary_color || "#DA3743",
            secondaryColor: schoolData.secondary_color || "",
            accentColor: schoolData.accent_color || "",
            phone: schoolData.phone || "",
            country: parsedCountry,
            state: parsedState,
            city: parsedCity,
            streetAddress: parsedStreet,
            email: schoolData.email || "",
            activityLogRetentionDays: schoolData.activity_log_retention_days ?? null,
            // ID Format Configuration
            schoolCode: schoolData.school_code || "",
            studentIdFormat: schoolData.student_id_format || "",
            studentIdPrefix: schoolData.student_id_prefix || "STU",
            allowManualStudentIds: schoolData.allow_manual_student_ids ?? true,
            teacherIdFormat: schoolData.teacher_id_format || "",
            teacherIdPrefix: schoolData.teacher_id_prefix || "EMP",
            allowManualTeacherIds: schoolData.allow_manual_teacher_ids ?? true,
            parentIdFormat: schoolData.parent_id_format || "",
            parentIdPrefix: schoolData.parent_id_prefix || "PAR",
            allowManualParentIds: schoolData.allow_manual_parent_ids ?? true,
            staffIdFormat: schoolData.staff_id_format || "",
            staffIdPrefix: schoolData.staff_id_prefix || "STF",
            allowManualStaffIds: schoolData.allow_manual_staff_ids ?? true,
          })

          // Set logo preview if logo URL exists
          if (schoolData.logo_url) {
            // Logo URL from backend should already be absolute or relative
            // If it's relative, construct the backend URL dynamically
            let logoUrl = schoolData.logo_url
            if (!logoUrl.startsWith("http")) {
              // Construct backend URL from current origin (same as config-loader)
              const protocol = window.location.protocol
              const hostname = window.location.hostname
              
              let backendHostname: string
              
              if (hostname !== "localhost" && !hostname.startsWith("127.0.0.1")) {
                // Check if hostname already starts with 'api.'
                if (hostname.startsWith("api.")) {
                  backendHostname = hostname
                } else {
                  // Prepend 'api.' to the hostname
                  // e.g., stpaul.schoolbase.africa -> api.stpaul.schoolbase.africa
                  backendHostname = `api.${hostname}`
                }
              } else {
                backendHostname = hostname
              }
              
              const backendOrigin = `${protocol}//${backendHostname}${hostname === "localhost" ? `:${process.env.NEXT_PUBLIC_BACKEND_PORT || 3008}` : ""}`
              // Ensure proper path concatenation - add leading slash if missing
              logoUrl = logoUrl.startsWith("/") 
                ? `${backendOrigin}${logoUrl}`
                : `${backendOrigin}/${logoUrl}`
            }
            setLogoPreview(logoUrl)
          }
        }
      } catch (error) {
        console.error("Failed to load school data:", error)
        toast.error("Failed to load school information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchoolData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB")
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Build FormData for multipart/form-data request (supports file upload)
      const formDataToSend = new FormData()

      // Add text fields
      formDataToSend.append("name", formData.schoolName)
      // Combine address fields into a single address string
      const addressParts = [
        formData.streetAddress,
        formData.city,
        formData.state,
        formData.country,
      ].filter(Boolean)
      const fullAddress = addressParts.join(", ")
      if (fullAddress) formDataToSend.append("address", fullAddress)
      if (formData.email) formDataToSend.append("email", formData.email)
      if (formData.phone) formDataToSend.append("phone", formData.phone)
      if (formData.primaryColor)
        formDataToSend.append("primary_color", formData.primaryColor)
      if (formData.secondaryColor)
        formDataToSend.append("secondary_color", formData.secondaryColor)
      if (formData.accentColor)
        formDataToSend.append("accent_color", formData.accentColor)
      
      // Add activity log retention days
      if (formData.activityLogRetentionDays !== null && formData.activityLogRetentionDays !== undefined) {
        formDataToSend.append("activity_log_retention_days", formData.activityLogRetentionDays.toString())
      } else {
        // Send null/empty to indicate "keep forever"
        formDataToSend.append("activity_log_retention_days", "")
      }

      // Add ID Format Configuration
      if (formData.schoolCode) formDataToSend.append("school_code", formData.schoolCode)
      if (formData.studentIdFormat) formDataToSend.append("student_id_format", formData.studentIdFormat)
      if (formData.studentIdPrefix) formDataToSend.append("student_id_prefix", formData.studentIdPrefix)
      formDataToSend.append("allow_manual_student_ids", formData.allowManualStudentIds ? "true" : "false")
      if (formData.teacherIdFormat) formDataToSend.append("teacher_id_format", formData.teacherIdFormat)
      if (formData.teacherIdPrefix) formDataToSend.append("teacher_id_prefix", formData.teacherIdPrefix)
      formDataToSend.append("allow_manual_teacher_ids", formData.allowManualTeacherIds ? "true" : "false")
      if (formData.parentIdFormat) formDataToSend.append("parent_id_format", formData.parentIdFormat)
      if (formData.parentIdPrefix) formDataToSend.append("parent_id_prefix", formData.parentIdPrefix)
      formDataToSend.append("allow_manual_parent_ids", formData.allowManualParentIds ? "true" : "false")
      if (formData.staffIdFormat) formDataToSend.append("staff_id_format", formData.staffIdFormat)
      if (formData.staffIdPrefix) formDataToSend.append("staff_id_prefix", formData.staffIdPrefix)
      formDataToSend.append("allow_manual_staff_ids", formData.allowManualStaffIds ? "true" : "false")

      // Add logo file if provided
      if (logoFile) {
        formDataToSend.append("logo", logoFile)
      }

      // Make PATCH request to update school
      // Use /school (without /api/v1) when proxy=true, as the proxy route will prepend /api/v1
      const response = await apiFetch<{ data: SchoolData }>(
        "/school",
        {
          method: "PATCH",
          data: formDataToSend,
        },
        true // Use proxy for authenticated request
      )

      const updatedSchool = response?.data || response

      // Update form fields with the response data
      if (updatedSchool) {
        // Parse updated address
        const updatedAddress = updatedSchool.address || ""
        let parsedCountry = "Nigeria"
        let parsedState = ""
        let parsedCity = ""
        let parsedStreet = updatedAddress

        if (updatedAddress.includes(",")) {
          const parts = updatedAddress.split(",").map((p: string) => p.trim())
          if (parts.length >= 2) {
            parsedStreet = parts[0] || ""
            parsedCity = parts[1] || ""
            if (parts.length >= 3) {
              parsedState = parts[2] || ""
            }
            if (parts.length >= 4) {
              parsedCountry = parts[3] || "Nigeria"
            }
          }
        }

        setFormData({
          schoolName: updatedSchool.name || formData.schoolName,
          primaryColor: updatedSchool.primary_color || formData.primaryColor,
          secondaryColor: updatedSchool.secondary_color || formData.secondaryColor,
          accentColor: updatedSchool.accent_color || formData.accentColor,
          phone: updatedSchool.phone || formData.phone,
          country: parsedCountry,
          state: parsedState,
          city: parsedCity,
          streetAddress: parsedStreet,
          email: updatedSchool.email || formData.email,
          activityLogRetentionDays: updatedSchool.activity_log_retention_days ?? null,
          // ID Format Configuration
          schoolCode: updatedSchool.school_code || "",
          studentIdFormat: updatedSchool.student_id_format || "",
          studentIdPrefix: updatedSchool.student_id_prefix || "STU",
          allowManualStudentIds: updatedSchool.allow_manual_student_ids ?? true,
          teacherIdFormat: updatedSchool.teacher_id_format || "",
          teacherIdPrefix: updatedSchool.teacher_id_prefix || "EMP",
          allowManualTeacherIds: updatedSchool.allow_manual_teacher_ids ?? true,
          parentIdFormat: updatedSchool.parent_id_format || "",
          parentIdPrefix: updatedSchool.parent_id_prefix || "PAR",
          allowManualParentIds: updatedSchool.allow_manual_parent_ids ?? true,
          staffIdFormat: updatedSchool.staff_id_format || "",
          staffIdPrefix: updatedSchool.staff_id_prefix || "STF",
          allowManualStaffIds: updatedSchool.allow_manual_staff_ids ?? true,
        })

        // Update logo preview if logo URL changed
        // Construct backend URL dynamically from current origin (same as config-loader)
        if (updatedSchool.logo_url) {
          let logoUrl = updatedSchool.logo_url
          if (!logoUrl.startsWith("http")) {
            const protocol = window.location.protocol
            const hostname = window.location.hostname
            
            let backendHostname: string
            
            if (hostname !== "localhost" && !hostname.startsWith("127.0.0.1")) {
              // Check if hostname already starts with 'api.'
              if (hostname.startsWith("api.")) {
                backendHostname = hostname
              } else {
                // Prepend 'api.' to the hostname
                // e.g., stpaul.schoolbase.africa -> api.stpaul.schoolbase.africa
                backendHostname = `api.${hostname}`
              }
            } else {
              backendHostname = hostname
            }
            
            const backendOrigin = `${protocol}//${backendHostname}${hostname === "localhost" ? `:${process.env.NEXT_PUBLIC_BACKEND_PORT || 3008}` : ""}`
            // Ensure proper path concatenation - add leading slash if missing
            logoUrl = logoUrl.startsWith("/") 
              ? `${backendOrigin}${logoUrl}`
              : `${backendOrigin}/${logoUrl}`
          }
          setLogoPreview(logoUrl)
        }

        // Clear the file input since we've uploaded it
        setLogoFile(null)
      }

      toast.success("School information updated successfully")

      // Force reload school config to update the UI theme/branding immediately
      await loadConfig(true)
    } catch (error) {
      console.error("Failed to update school:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update school information"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-muted-foreground mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading school information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">School Information</h2>
        <p className="text-muted-foreground">Manage your school information.</p>
      </div>

      <Card>
        <CardContent className="space-y-6 px-0 lg:px-6">
          <div className="space-y-4 px-4 lg:px-0">
            <div>
              <h3 className="text-base font-semibold">School Logo</h3>
              <p className="text-muted-foreground text-sm">Update your School logo</p>
            </div>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={logoPreview || ""}
                  alt="School Logo"
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted">LOGO</AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePhotoClick}
                className="gap-2 border text-sm text-[#535353] hover:border-2 hover:bg-white"
              >
                Change photo
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-4 lg:px-0">
            <div className="space-y-2">
              <Label htmlFor="schoolName">
                School Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="e.g. School Folio"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">
                Primary Brand Color <span className="text-red-500">*</span>
              </Label>
              
              {/* Predefined color swatches */}
              <div className="mb-3">
                <p className="text-muted-foreground mb-2 text-xs">Quick select:</p>
                <div className="flex flex-wrap gap-1.5">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, primaryColor: color.value }))
                      }
                      className={`h-5 w-5 rounded border-2 transition-all hover:scale-110 ${
                        formData.primaryColor.toUpperCase() === color.value.toUpperCase()
                          ? "border-gray-900 ring-1 ring-offset-1 ring-gray-400 scale-110"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>

              {/* Color picker and text input */}
              <div className="flex gap-4">
                <div className="relative h-12 w-16 overflow-hidden rounded-md border">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="absolute -top-2 -left-2 h-16 w-20 cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  id="primaryColorText"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  placeholder="#DA3743"
                  className="flex-1"
                  pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                This color will be used throughout your portal interface
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Brand Color</Label>
              
              {/* Predefined color swatches */}
              <div className="mb-3">
                <p className="text-muted-foreground mb-2 text-xs">Quick select:</p>
                <div className="flex flex-wrap gap-1.5">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, secondaryColor: color.value }))
                      }
                      className={`h-5 w-5 rounded border-2 transition-all hover:scale-110 ${
                        formData.secondaryColor?.toUpperCase() === color.value.toUpperCase()
                          ? "border-gray-900 ring-1 ring-offset-1 ring-gray-400 scale-110"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>

              {/* Color picker and text input */}
              <div className="flex gap-4">
                <div className="relative h-12 w-16 overflow-hidden rounded-md border">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor || "#8B5CF6"}
                    onChange={handleChange}
                    className="absolute -top-2 -left-2 h-16 w-20 cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  id="secondaryColorText"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                  placeholder="#8B5CF6"
                  className="flex-1"
                  pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Secondary color for accents and highlights
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              
              {/* Predefined color swatches */}
              <div className="mb-3">
                <p className="text-muted-foreground mb-2 text-xs">Quick select:</p>
                <div className="flex flex-wrap gap-1.5">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, accentColor: color.value }))
                      }
                      className={`h-5 w-5 rounded border-2 transition-all hover:scale-110 ${
                        formData.accentColor?.toUpperCase() === color.value.toUpperCase()
                          ? "border-gray-900 ring-1 ring-offset-1 ring-gray-400 scale-110"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>

              {/* Color picker and text input */}
              <div className="flex gap-4">
                <div className="relative h-12 w-16 overflow-hidden rounded-md border">
                  <input
                    type="color"
                    name="accentColor"
                    value={formData.accentColor || "#36D399"}
                    onChange={handleChange}
                    className="absolute -top-2 -left-2 h-16 w-20 cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  id="accentColorText"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  placeholder="#36D399"
                  className="flex-1"
                  pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Accent color for special UI elements
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                School Phone No <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(000) 000-000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                School Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@school.edu"
                required
              />
            </div>

            <div className="space-y-4">
              <Label>
                Address <span className="text-red-500">*</span>
              </Label>
              
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ 
                          ...prev, 
                          country: value,
                          state: "" // Reset state when country changes
                        }))
                      }
                    >
                      <SelectTrigger className="w-full h-11 rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm focus:border-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] rounded-md border shadow-lg">
                        {Object.keys(AFRICAN_COUNTRIES)
                          .sort()
                          .map((country) => (
                            <SelectItem key={country} value={country} className="cursor-pointer">
                              {country}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State/Province <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, state: value }))
                      }
                      disabled={!formData.country || getStatesForCountry(formData.country).length === 0}
                      required
                    >
                      <SelectTrigger className="w-full h-11 rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm focus:border-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 disabled:bg-gray-50 disabled:cursor-not-allowed">
                        <SelectValue 
                          placeholder={
                            !formData.country 
                              ? "Select country first" 
                              : getStatesForCountry(formData.country).length === 0
                              ? "No states available"
                              : "Select state/province"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] rounded-md border shadow-lg">
                        {getStatesForCountry(formData.country).map((state) => (
                          <SelectItem key={state} value={state} className="cursor-pointer">
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">
                    City/Town <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Lagos, Abuja, Port Harcourt"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streetAddress">
                    Street Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    placeholder="e.g. 123 Main Street, Victoria Island"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div>
                <Label htmlFor="activityLogRetention">
                  Activity Log Retention Period
                </Label>
                <p className="text-muted-foreground text-sm mb-4">
                  Set how long to keep activity logs. Logs older than this period will be automatically deleted. Leave empty to keep logs forever.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      id="activityLogRetention"
                      name="activityLogRetention"
                      type="number"
                      min="0"
                      placeholder="Days (e.g., 90) or leave empty for forever"
                      value={formData.activityLogRetentionDays ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData((prev) => ({
                          ...prev,
                          activityLogRetentionDays: value === "" ? null : parseInt(value, 10) || 0,
                        }))
                      }}
                      className="max-w-xs"
                    />
                    <span className="text-muted-foreground text-sm">
                      {formData.activityLogRetentionDays === null || formData.activityLogRetentionDays === undefined
                        ? "Keep forever"
                        : formData.activityLogRetentionDays === 0
                        ? "Delete immediately"
                        : `Keep for ${formData.activityLogRetentionDays} day${formData.activityLogRetentionDays !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, activityLogRetentionDays: 30 }))}
                      className="text-xs"
                    >
                      30 days
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, activityLogRetentionDays: 90 }))}
                      className="text-xs"
                    >
                      90 days
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, activityLogRetentionDays: 180 }))}
                      className="text-xs"
                    >
                      180 days
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, activityLogRetentionDays: 365 }))}
                      className="text-xs"
                    >
                      1 year
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, activityLogRetentionDays: null }))}
                      className="text-xs"
                    >
                      Forever
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ID Format Configuration Section */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label>ID Format Configuration</Label>
                <p className="text-muted-foreground text-sm mb-4">
                  Configure custom ID formats for auto-generation, or use your existing IDs by enabling manual entry. 
                  <strong> Format configuration is optional</strong> - if you leave it empty, you can use any existing ID format from your system. 
                  Simply enable "Allow Manual IDs" and enter your existing IDs when creating users or importing from CSV.
                </p>
              </div>

              {/* School Code (Shared) */}
              <div className="space-y-2">
                <Label htmlFor="schoolCode">
                  School Code
                </Label>
                <Input
                  id="schoolCode"
                  name="schoolCode"
                  value={formData.schoolCode}
                  onChange={handleChange}
                  placeholder="e.g., ABC, XYZ"
                  maxLength={20}
                  className="max-w-xs"
                />
                <p className="text-muted-foreground text-xs">
                  School abbreviation/code used in ID formats with {'{SCHOOL_CODE}'} placeholder (max 20 characters)
                </p>
              </div>

              {/* Tabs for different user types */}
              <Tabs defaultValue="students" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="teachers">Teachers</TabsTrigger>
                  <TabsTrigger value="parents">Parents</TabsTrigger>
                  <TabsTrigger value="staff">Staff</TabsTrigger>
                </TabsList>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentIdFormat">
                      Student ID Format (Optional)
                    </Label>
                    <Input
                      id="studentIdFormat"
                      name="studentIdFormat"
                      value={formData.studentIdFormat}
                      onChange={handleChange}
                      placeholder="e.g., STU-{YEAR}-{SEQUENCE:4} or leave empty"
                      maxLength={100}
                    />
                    <p className="text-muted-foreground text-xs">
                      <strong>Optional:</strong> Format pattern for auto-generating new IDs. Placeholders: {'{YEAR}'}, {'{YEAR_SHORT}'}, {'{SEQUENCE}'}, {'{SEQUENCE:N}'}, {'{PREFIX}'}, {'{SCHOOL_CODE}'}. 
                      <strong> Leave empty to use any existing ID format</strong> - just enable "Allow Manual IDs" below and enter your existing IDs directly.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentIdPrefix">
                      Student ID Prefix
                    </Label>
                    <Input
                      id="studentIdPrefix"
                      name="studentIdPrefix"
                      value={formData.studentIdPrefix}
                      onChange={handleChange}
                      placeholder="STU"
                      maxLength={20}
                      className="max-w-xs"
                    />
                    <p className="text-muted-foreground text-xs">
                      Default prefix used with {'{PREFIX}'} placeholder (default: STU)
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowManualStudentIds">
                        Allow Manual Student IDs
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        <strong>Enable this to use your existing student ID format.</strong> When enabled, you can enter any student ID format directly when creating students or importing from CSV. Perfect for schools migrating from existing systems.
                      </p>
                    </div>
                    <Switch
                      id="allowManualStudentIds"
                      checked={formData.allowManualStudentIds}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, allowManualStudentIds: checked }))
                      }
                    />
                  </div>
                </TabsContent>

                {/* Teachers Tab */}
                <TabsContent value="teachers" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacherIdFormat">
                      Teacher ID Format (Optional)
                    </Label>
                    <Input
                      id="teacherIdFormat"
                      name="teacherIdFormat"
                      value={formData.teacherIdFormat}
                      onChange={handleChange}
                      placeholder="e.g., EMP-{YEAR}-{SEQUENCE:3} or leave empty"
                      maxLength={100}
                    />
                    <p className="text-muted-foreground text-xs">
                      <strong>Optional:</strong> Format pattern for auto-generating new IDs. Leave empty to use any existing ID format - enable "Allow Manual IDs" below to enter existing IDs directly.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherIdPrefix">
                      Teacher ID Prefix
                    </Label>
                    <Input
                      id="teacherIdPrefix"
                      name="teacherIdPrefix"
                      value={formData.teacherIdPrefix}
                      onChange={handleChange}
                      placeholder="EMP"
                      maxLength={20}
                      className="max-w-xs"
                    />
                    <p className="text-muted-foreground text-xs">
                      Default prefix used with {'{PREFIX}'} placeholder (default: EMP)
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowManualTeacherIds">
                        Allow Manual Teacher IDs
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        <strong>Enable this to use your existing teacher ID format.</strong> When enabled, you can enter any teacher ID format directly when creating teachers or importing from CSV.
                      </p>
                    </div>
                    <Switch
                      id="allowManualTeacherIds"
                      checked={formData.allowManualTeacherIds}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, allowManualTeacherIds: checked }))
                      }
                    />
                  </div>
                </TabsContent>

                {/* Parents Tab */}
                <TabsContent value="parents" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentIdFormat">
                      Parent ID Format (Optional)
                    </Label>
                    <Input
                      id="parentIdFormat"
                      name="parentIdFormat"
                      value={formData.parentIdFormat}
                      onChange={handleChange}
                      placeholder="e.g., PAR-{YEAR}-{SEQUENCE:4}"
                      maxLength={100}
                    />
                    <p className="text-muted-foreground text-xs">
                      Format pattern with placeholders. Leave empty if parent IDs are not needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentIdPrefix">
                      Parent ID Prefix
                    </Label>
                    <Input
                      id="parentIdPrefix"
                      name="parentIdPrefix"
                      value={formData.parentIdPrefix}
                      onChange={handleChange}
                      placeholder="PAR"
                      maxLength={20}
                      className="max-w-xs"
                    />
                    <p className="text-muted-foreground text-xs">
                      Default prefix used with {'{PREFIX}'} placeholder (default: PAR)
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowManualParentIds">
                        Allow Manual Parent IDs
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        <strong>Enable this to use your existing parent ID format.</strong> When enabled, you can enter any parent ID format directly when creating parents or importing from CSV.
                      </p>
                    </div>
                    <Switch
                      id="allowManualParentIds"
                      checked={formData.allowManualParentIds}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, allowManualParentIds: checked }))
                      }
                    />
                  </div>
                </TabsContent>

                {/* Staff Tab */}
                <TabsContent value="staff" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="staffIdFormat">
                      Staff ID Format (Optional)
                    </Label>
                    <Input
                      id="staffIdFormat"
                      name="staffIdFormat"
                      value={formData.staffIdFormat}
                      onChange={handleChange}
                      placeholder="e.g., STF-{YEAR}-{SEQUENCE:3} or leave empty"
                      maxLength={100}
                    />
                    <p className="text-muted-foreground text-xs">
                      <strong>Optional:</strong> Format pattern for auto-generating new IDs. Leave empty to use any existing ID format - enable "Allow Manual IDs" below to enter existing IDs directly.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staffIdPrefix">
                      Staff ID Prefix
                    </Label>
                    <Input
                      id="staffIdPrefix"
                      name="staffIdPrefix"
                      value={formData.staffIdPrefix}
                      onChange={handleChange}
                      placeholder="STF"
                      maxLength={20}
                      className="max-w-xs"
                    />
                    <p className="text-muted-foreground text-xs">
                      Default prefix used with {'{PREFIX}'} placeholder (default: STF)
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowManualStaffIds">
                        Allow Manual Staff IDs
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        <strong>Enable this to use your existing staff ID format.</strong> When enabled, you can enter any staff ID format directly when creating staff or importing from CSV.
                      </p>
                    </div>
                    <Switch
                      id="allowManualStaffIds"
                      checked={formData.allowManualStaffIds}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, allowManualStaffIds: checked }))
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 w-full text-white lg:w-fit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
