import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Maximize2,
  Eye,
  Bed,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Share2,
  MapPin,
  Building2,
  DoorOpen,
  MoreHorizontal,
  Calendar,
  Clock,
  Sofa
} from 'lucide-react';
import { getRoomBySlug } from '@/data/roomsData';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/utils/helpers/format';

export const RoomDetailPageRealEstate = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'location' | 'building' | 'floorplan'>('overview');

  const room = getRoomBySlug(slug || '');

  if (!room) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Room Not Found</h2>
          <p className="text-neutral-600 mb-6">
            The room you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => navigate('/rooms')}>
            Back to Rooms
          </Button>
        </Card>
      </div>
    );
  }

  const handleBookNow = () => {
    const params = new URLSearchParams();
    params.set('room', room.slug);
    if (searchParams.get('checkIn')) params.set('checkIn', searchParams.get('checkIn')!);
    if (searchParams.get('checkOut')) params.set('checkOut', searchParams.get('checkOut')!);
    params.set('adults', searchParams.get('adults') || '1');
    params.set('children', searchParams.get('children') || '0');
    navigate(`/booking?${params.toString()}`);
  };

  const openLightbox = (index: number) => {
    setLightboxImage(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxImage((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setLightboxImage((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-24 left-4 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/rooms')}
          className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} className="text-neutral-900" />
        </motion.button>
      </motion.div>

      {/* Image Gallery Section - Real Estate Style */}
      <div className="relative h-[500px] sm:h-[600px] bg-neutral-900">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 h-full p-2">
          {/* Main Large Image - 8 columns on desktop, full width on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-8 relative rounded-2xl overflow-hidden cursor-pointer group h-full"
            onClick={() => openLightbox(0)}
          >
            <img
              src={room.images?.[0] || '/placeholder-room.jpg'}
              alt={room.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

            {/* Virtual Tour Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-6 z-10"
            >
              <button className="flex items-center gap-2 px-5 py-3 bg-white/95 backdrop-blur-sm rounded-full text-neutral-900 font-bold text-sm hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-105">
                <Eye size={18} />
                <span>Tour Virtual 360°</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column - 4 columns, 2 rows - Hidden on mobile */}
          <div className="hidden sm:grid sm:col-span-4 grid-rows-2 gap-2">
            {room.images.slice(1, 3).map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(index + 1)}
              >
                <img
                  src={image}
                  alt={`${room.name} - ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

                {/* Photo Counter on Last Image */}
                {index === 1 && room.images.length > 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors flex items-center justify-center"
                  >
                    <div className="flex items-center gap-3 text-white">
                      <Eye size={24} />
                      <div className="text-center">
                        <div className="text-2xl font-bold">{room.images.length}</div>
                        <div className="text-sm">Fotos</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl -mt-20 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Title Card - Elevated above gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3 leading-tight">
                    {room.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-neutral-600 mb-4">
                    <MapPin size={18} className="text-teal-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Itaim Bibi • Unidade 46 • Edifício Guajará</span>
                  </div>

                  {/* Rating */}
                  {room.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < Math.floor(room.rating!) ? 'currentColor' : 'none'}
                            className="text-amber-500"
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-neutral-900">
                        {room.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-neutral-500">
                        ({room.reviewCount} avaliações)
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:ml-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                  >
                    <Heart
                      size={20}
                      className={isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-700'}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                  >
                    <Share2 size={20} className="text-neutral-700" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                  >
                    <MoreHorizontal size={20} className="text-neutral-700" />
                  </motion.button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-0 border-b border-neutral-200">
                {[
                  { id: 'overview', label: 'Visão Geral' },
                  { id: 'location', label: 'Localização' },
                  { id: 'building', label: 'Condomínio' },
                  { id: 'floorplan', label: 'Planta' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 font-semibold text-sm transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-primary-600'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Quick Stats - Real Estate Style */}
                  <Card padding="lg" className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-3 sm:gap-4"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                          <Bed size={24} className="text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-neutral-900">02</div>
                          <div className="text-xs sm:text-sm text-neutral-600 font-medium">Quartos</div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="flex items-center gap-3 sm:gap-4"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                          <Sofa size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-neutral-900">01</div>
                          <div className="text-xs sm:text-sm text-neutral-600 font-medium">Suítes</div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-center gap-3 sm:gap-4"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                          <Maximize2 size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-neutral-900">{room.size}</div>
                          <div className="text-xs sm:text-sm text-neutral-600 font-medium">m² área</div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.75 }}
                        className="flex items-center gap-3 sm:gap-4"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                          <Users size={24} className="text-amber-600" />
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-neutral-900">{room.maxGuests}</div>
                          <div className="text-xs sm:text-sm text-neutral-600 font-medium">Pessoas</div>
                        </div>
                      </motion.div>
                    </div>
                  </Card>

                  {/* Description */}
                  <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                      About This Property
                    </h2>
                    {room.shortDescription && (
                      <div className="mb-4 p-4 bg-primary-50 rounded-xl">
                        <p className="text-neutral-800 font-semibold leading-relaxed">
                          {room.shortDescription}
                        </p>
                      </div>
                    )}
                    <p className="text-neutral-700 text-base leading-relaxed">
                      {room.description}
                    </p>
                  </Card>

                  {/* Features */}
                  {room.features && room.features.length > 0 && (
                    <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                      <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                        Destaques do Imóvel
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {room.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                            <span className="font-medium text-neutral-900">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Amenities */}
                  <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                      Comodidades
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {room.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          <Check size={20} className="text-green-600 flex-shrink-0" />
                          <span className="text-neutral-900">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                      Localização
                    </h2>
                    <div className="aspect-video bg-neutral-200 rounded-xl mb-6 flex items-center justify-center">
                      <MapPin size={48} className="text-neutral-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-primary-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-neutral-900">Endereço</div>
                          <div className="text-neutral-700">Rua Capitão Pinto Ferreira, 95 - Itaim Bibi</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Building2 size={20} className="text-primary-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-neutral-900">Bairro</div>
                          <div className="text-neutral-700">Downtown District</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'building' && (
                <motion.div
                  key="building"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                      Informações do Condomínio
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <span className="text-neutral-700">Nome do Edifício</span>
                        <span className="font-semibold text-neutral-900">Edifício Guajará</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <span className="text-neutral-700">Unidade</span>
                        <span className="font-semibold text-neutral-900">46</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <span className="text-neutral-700">Total de Andares</span>
                        <span className="font-semibold text-neutral-900">12</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'floorplan' && (
                <motion.div
                  key="floorplan"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                      Planta do Imóvel
                    </h2>
                    <div className="aspect-video bg-neutral-200 rounded-xl flex items-center justify-center">
                      <DoorOpen size={48} className="text-neutral-400" />
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Policies */}
            <Card padding="lg" className="bg-white rounded-2xl shadow-sm mt-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Políticas e Informações
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                  <Calendar size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-neutral-900 mb-1">Check-in</div>
                    <div className="text-sm text-neutral-700">After 3:00 PM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
                  <Clock size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-neutral-900 mb-1">Check-out</div>
                    <div className="text-sm text-neutral-700">Before 11:00 AM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                  <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-neutral-900 mb-1">Cancelamento</div>
                    <div className="text-sm text-neutral-700">Grátis até 24h antes</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                  <X size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-neutral-900 mb-1">Fumar</div>
                    <div className="text-sm text-neutral-700">Proibido fumar</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Sticky Price Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24"
            >
              <Card padding="none" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Price Header with Gradient */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 sm:p-8">
                  <div className="text-xs sm:text-sm font-semibold text-teal-800 uppercase tracking-wide mb-2">
                    Valor de Venda
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-600">
                      {formatCurrency(room.price)}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-700 font-medium">
                    {formatCurrency(room.price / room.size)} por m²
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  {/* CTA Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleBookNow}
                      className="mb-6 font-bold py-4 text-base bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all"
                    >
                      Agendar Visita
                    </Button>
                  </motion.div>

                {/* Monthly Expenses */}
                <div className="pt-6 border-t border-neutral-200 mb-6">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase mb-4 tracking-wide">
                    Despesas Mensais
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">Condomínio</span>
                      <span className="font-bold text-neutral-900">R$ 1.532</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">IPTU</span>
                      <span className="font-bold text-neutral-900">R$ 317</span>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase mb-4 tracking-wide">
                    Detalhes do Imóvel
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Tipo</span>
                      <span className="font-semibold text-neutral-900 capitalize">{room.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Área Total</span>
                      <span className="font-semibold text-neutral-900">{room.size} m²</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Vista</span>
                      <span className="font-semibold text-neutral-900">{room.view}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Capacidade</span>
                      <span className="font-semibold text-neutral-900">{room.maxGuests} pessoas</span>
                    </div>
                  </div>
                </div>
                </div>
              </Card>

              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card padding="lg" className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl shadow-sm border border-neutral-200 mt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Building2 size={24} className="text-white" />
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-2 text-lg">Precisa de ajuda?</h3>
                    <p className="text-sm text-neutral-600 mb-5 leading-relaxed">
                      Nossa equipe especializada está pronta para atendê-lo.
                    </p>
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      className="font-bold bg-white hover:bg-neutral-50 shadow-sm"
                    >
                      Fale com Corretor
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-semibold">
              {lightboxImage + 1} / {room.images.length}
            </div>

            {room.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            <motion.img
              key={lightboxImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={room.images[lightboxImage]}
              alt={`${room.name} - ${lightboxImage + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};