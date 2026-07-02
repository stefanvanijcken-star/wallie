import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

type WallieLogoProps = ComponentPropsWithoutRef<"svg">

export function WallieLogo({ className, ...props }: WallieLogoProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0", className)}
      fill="none"
      viewBox="0 0 682 484"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M675.566 248.441C679.686 244.317 682 238.723 682 232.891V22.0352C682 2.44321 658.334 -7.36848 644.493 6.48513L409.2 242V461.963C409.2 481.557 432.866 491.369 446.707 477.514L675.566 248.441Z"
        fill="currentColor"
      />
      <path
        d="M409.2 242V22.0352C409.2 2.44321 385.534 -7.36848 371.693 6.48513L136.4 242V461.963C136.4 481.557 160.065 491.369 173.906 477.514L409.2 242Z"
        fill="currentColor"
        opacity="0.82"
      />
      <path
        d="M136.4 242V22.0352C136.4 2.44321 112.735 -7.36849 98.8942 6.48513L6.435 99.031C2.31475 103.155 0 108.748 0 114.581V325.437C0 345.029 23.6653 354.84 37.5058 340.987L136.4 242Z"
        fill="currentColor"
        opacity="0.64"
      />
    </svg>
  )
}
