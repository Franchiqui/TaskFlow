'use client';

import * as React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
}

const Modal = React.memo(function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  initialFocus,
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOverlayClick ? onClose : () => {}}
        initialFocus={initialFocus}
      >
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={cn(
                  'relative transform overflow-hidden rounded-lg bg-gray-900 text-left shadow-xl transition-all w-full',
                  sizeClasses[size],
                  'border border-gray-800'
                )}
              >
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                    {title && (
                      <Dialog.Title
                        className="text-lg font-semibold text-white"
                        id="modal-title"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    {showCloseButton && (
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        onClick={onClose}
                        aria-label="Close modal"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                {description && (
                  <div className="px-6 pt-4">
                    <Dialog.Description
                      className="text-sm text-gray-400"
                      id="modal-description"
                    >
                      {description}
                    </Dialog.Description>
                  </div>
                )}

                <div className="px-6 py-4">{children}</div>

                <div className="border-t border-gray-800 px-6 py-4">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      form="modal-form"
                      className="inline-flex justify-center rounded-md bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
});

Modal.displayName = 'Modal';

export { Modal };