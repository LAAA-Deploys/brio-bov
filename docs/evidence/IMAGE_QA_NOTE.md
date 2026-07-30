# Brio image QA note

Accessed and visually checked: 2026-07-30.

## Recommended publication set

- 359 Parke hero: `subjects/359-parke/359-parke-hero-front.jpg`.
- 1623 Menlo hero: `subjects/1623-menlo/1623-menlo-online-primary.jpg`; `1623-menlo-online-building-02.jpg` is the strongest alternate exterior.
- All six Parke sold comps now have real property images. For 1757 E Villa, prefer `1757-e-villa-st.jpg` only with a card crop that excludes the competing-broker watermark at bottom right; use the unbranded parking view only as the fallback.
- Both Menlo sold comps and both active comps have real property images.
- Real rent-comp images were verified for 570 N Los Robles, 1037 Dewey, 2231 Ellendale, and 980 Menlo. No credible exact-property image was found for the other selected rent observations, so omit imagery for those observations rather than use a placeholder or neighboring property.
- The four selected LAAA proof images are real deal-story heroes. Use 260 Linda Rosa and 4123 Ocean View for Parke; use 6860 Woodley and 1010 S Bedford for Menlo.

## Integrity and dimensions

- All 36 local image files decode successfully.
- No hotlinks are required at runtime; every selected asset is downloaded locally.
- No synthetic property image is included. The 1037 Dewey website exposes a separate 3D-rendering asset; it was deliberately excluded.
- Lowest-resolution assets: Parke laundry is 320x240 and should remain a small supporting image; 843 S Ardmore is 480x640 portrait and needs a center crop; Menlo's exact exterior hero is 600x375 and should not be enlarged beyond a normal page hero without careful treatment.
- Catalina placeholder imagery was not copied and should remain excluded.

## Print and responsive handling

- Use `object-fit: cover` with an explicit focal position for portrait/square comp images.
- Do not stretch the Menlo exterior or Parke laundry image.
- Confirm the 1757 E Villa crop at desktop and mobile widths so no competing-broker watermark is visible.
- Preserve local filenames in the manifest so the final source packet remains auditable.
