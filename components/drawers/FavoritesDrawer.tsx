"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Heart } from 'lucide-react'
import { useFavoritesStore } from '@/lib/stores/favoritesStore' // ajusta ruta
import Link from 'next/link'
import { motion } from 'framer-motion'

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-6">
                      <div className="flex items-center gap-3">
                        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                        <Dialog.Title className="text-2xl font-bold text-gray-900">
                          Mis Favoritos ({favorites.length})
                        </Dialog.Title>
                      </div>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                      >
                        <X className="h-7 w-7" />
                      </button>
                    </div>

                    {/* Lista de favoritos */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      {favorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                          <Heart className="w-16 h-16 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">Aún no tienes favoritos</p>
                          <p className="mt-2">Agrega productos o planes que te gusten</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {favorites.map(item => (
                            <div
                              key={`${item.type}-${item.id}`}
                              className="group relative flex gap-4 bg-white rounded-xl border border-gray-100 hover:border-gray-300 transition-all overflow-hidden shadow-sm hover:shadow"
                            >
                              <Link href={`/${item.type}s/${item.slug}`} className="flex-1 flex">
                                <div className="w-28 h-28 flex-shrink-0">
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 p-4">
                                  <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 capitalize mt-1">{item.type}</p>
                                </div>
                              </Link>

                              <button
                                onClick={() => removeFavorite(item.id, item.type)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-red-500 hover:bg-red-50 transition"
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
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
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