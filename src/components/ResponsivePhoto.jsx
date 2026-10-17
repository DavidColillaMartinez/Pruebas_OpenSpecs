export function ResponsivePhoto({ photo, ...props }) {
  return (
    <picture className="lrmq-responsive-photo">
      <source media="(min-width: 1024px) and (min-height: 560px)" srcSet={photo.desktop.srcSet || photo.desktop.src} sizes={photo.desktop.sizes} />
      <img {...props} src={photo.mobile.src} srcSet={photo.mobile.srcSet} sizes={photo.mobile.sizes} />
    </picture>
  );
}
