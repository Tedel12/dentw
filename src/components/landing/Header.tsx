import { SignInButton, SignUpButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { MenuIcon } from 'lucide-react'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'

const Header = () => {
  return (
    <nav className='fixed top-0 right-0 left-0 z-50 px-4 md:px-6 py-2 border-b border-border/50 bg-background/30 backdrop-blur-md h-16'>
      <div className='max-w-6xl mx-auto flex justify-between items-center gap-3'>
        <Link href="/" className='flex items-center gap-2'>
          <Image src={"/logo.png"} alt='dentwise logo' width={32} height={32} className='w-11' />
          <span className='font-semibold text-lg'>Dentwise</span>
        </Link>

        <div className='hidden md:flex items-center gap-8'>
          <a href="#how-it-works" className='text-muted-foreground hover:text-foreground transition-colors'>Comment ça marche ?</a>
          <a href="#pricing" className='text-muted-foreground hover:text-foreground transition-colors'>Tarification</a>
          <a href="#about" className='text-muted-foreground hover:text-foreground transition-colors'>A propos</a>
        </div>

        <div className='hidden md:flex items-center gap-3 cursor-pointer'>
          <SignInButton mode='modal'>
            <Button className='cursor-pointer' variant={"ghost"} size={"sm"}>
              Se connecter
            </Button>
          </SignInButton>
          <SignUpButton mode='modal'>
            <Button className='cursor-pointer' size={"sm"}>
              S'inscrire
            </Button>
          </SignUpButton>
        </div>

        <div className='md:hidden flex items-center gap-2'>
          <SignInButton mode='modal'>
            <Button className='cursor-pointer' variant={"ghost"} size={"sm"}>
              Connexion
            </Button>
          </SignInButton>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <MenuIcon className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-3">
                <SheetClose asChild>
                  <a href="#how-it-works" className='block rounded-xl p-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'>
                    Comment ça marche ?
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a href="#pricing" className='block rounded-xl p-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'>
                    Tarification
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a href="#about" className='block rounded-xl p-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'>
                    A propos
                  </a>
                </SheetClose>
                <SignUpButton mode='modal'>
                  <Button className='w-full mt-2'>S'inscrire</Button>
                </SignUpButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

export default Header
