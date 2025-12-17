import * as React from "react";

type ContainerProps<T extends React.ElementType = "div"> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Container<T extends React.ElementType = "div">({ as, className = "", children, ...props }: ContainerProps<T>) {
  const Comp = (as ?? "div") as React.ElementType;

  return (
    <Comp className={["mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className].join(" ")} {...props}>
      {children}
    </Comp>
  );
}
