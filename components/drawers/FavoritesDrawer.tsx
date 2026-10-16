"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Heart } from 'lucide-react'
import { useFavoritesStore } from '@/lib/stores/favoritesStore' // ajusta ruta
import Link from 'next/link'
import { SafeImage } from '@/components/others/SafeImage'

interface FavoritesDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function FavoritesDrawer({ isOpen, onClose }: FavoritesDrawerProps) {
  const { favorites, removeFavorite } = useFavoritesStore()

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Fondo oscuro */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        {/* Panel lateral */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col divide-y divide-line border-l-2 border-accent bg-surface">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-6">
                      <div className="flex items-center gap-3">
                        <Heart className="h-7 w-7 fill-accent text-accent" aria-hidden="true" />
                        <Dialog.Title className="text-3xl text-fg">
                          Mis Favoritos ({favorites.length})
                        </Dialog.Title>
                      </div>
                      <button
                        type="button"
                        aria-label="Cerrar favoritos" className="flex h-11 w-11 items-center justify-center text-fg transition-colors hover:bg-surface-3 hover:text-accent"
                        onClick={onClose}
                      >
                        <X className="h-7 w-7" />
                      </button>
                    </div>

                    {/* Lista de favoritos */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      {favorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted">
                          <Heart className="w-16 h-16 text-subtle mb-4" />
                          <p className="text-lg font-medium">Aún no tienes favoritos</p>
                          <p className="mt-2">Agrega productos o planes que te gusten</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {favorites.map(item => (
                            <div
                              key={`${item.type}-${item.id}`}
                              className="group relative flex gap-4 border border-line bg-surface-2 transition-colors hover:border-accent overflow-hidden"
                            >
                              <Link href={`/${item.type}s/${item.slug}`} className="flex-1 flex">
                                <div className="media aspect-square w-28 shrink-0">
                                  <SafeImage src={item.image} alt={item.title} sizes="112px" className="object-cover" />
                                </div>
                                <div className="flex-1 p-4">
                                  <h4 className="font-sans text-base font-bold normal-case tracking-normal text-fg line-clamp-2 group-hover:text-accent transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-sm text-muted capitalize mt-1">{item.type}</p>
                                </div>
                              </Link>

                              <button
                                aria-label="Quitar de favoritos"
                                onClick={() => removeFavorite(item.id, item.type)}
                                className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center bg-bg/85 text-fg transition-colors hover:bg-accent hover:text-on-accent"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-shrink-0 justify-end px-6 py-4">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}