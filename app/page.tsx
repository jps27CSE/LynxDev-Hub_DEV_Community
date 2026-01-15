import { Button } from "@/components/ui/button";

/**
 * Page component that renders a single styled Button labeled "Hello test".
 *
 * Renders a root <div> containing a Button with the classes "font-inter text-2xl".
 *
 * @returns The page's React element.
 */

export default function Home() {
  return (
    <div>
      <Button className="font-inter text-2xl">Hello test</Button>
    </div>
  );
}