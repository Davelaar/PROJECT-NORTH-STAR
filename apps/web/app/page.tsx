import Link from "next/link";
import { apiGet } from "@/lib/api";
import { messages } from "@/lib/messages/en";

type Filament = {
  uuid: string;
  productName: string;
  manufacturerName: string;
  materialCode: string;
  isSyntheticFixture: boolean;
};

export default async function HomePage() {
  const m = messages;
  let filaments: Filament[] = [];
  try {
    filaments = await apiGet<Filament[]>("/api/v1/filaments");
  } catch {
    filaments = [];
  }

  return (
    <div className="home">
      <section className="home-hero" aria-label="OpenFilament">
        <div className="home-hero-plane" aria-hidden="true" />
        <div className="home-hero-inner">
          <p className="home-brand">OpenFilament</p>
          <h1 className="home-headline">
            One filament. One profile. Every printer.
          </h1>
          <p className="home-lead">
            Stop calibrating the same filament over and over again.
          </p>
          <div className="home-cta">
            <form className="search-row home-search" action="/search" method="get">
              <input
                name="q"
                placeholder={m.home.searchPlaceholder}
                aria-label={m.nav.search}
                defaultValue="Flashforge Burnt Titanium"
              />
              <button type="submit">{m.home.searchButton}</button>
            </form>
            <div className="home-cta-links">
              <Link className="button" href="/submit">
                Submit calibration
              </Link>
              <Link className="button secondary" href="/export">
                Install a profile
              </Link>
              <Link className="button secondary" href="/rfid">
                Write RFID
              </Link>
            </div>
          </div>
        </div>
      </section>

      <article className="home-body">
        <section className="home-section">
          <p>
            3D printing has become increasingly advanced, but filament management
            is still fragmented.
          </p>
          <p>
            Your filament settings live inside one slicer.
            <br />
            Your calibrated profile exists on one computer.
            <br />
            Your RFID system only recognizes filament from one manufacturer.
            <br />
            Another user with the exact same printer and filament has already
            performed the same calibration — but you cannot easily use their
            results.
          </p>
          <p>We think that should change.</p>
          <p className="home-emphasis">
            OpenFilament is an open, community-driven filament database that
            connects physical filament, calibration data, slicer profiles and
            RFID identification in one independent platform.
          </p>
          <p className="home-tag">
            Calibrate once. Share what works. Use it everywhere.
          </p>
        </section>

        <section className="home-section">
          <h2>Your filament should not belong to your slicer</h2>
          <p>
            A filament profile should describe the filament and the machine it
            is used on — not the computer on which it happened to be calibrated.
          </p>
          <p>A properly calibrated profile may depend on:</p>
          <ul>
            <li>filament manufacturer;</li>
            <li>filament product and variant;</li>
            <li>printer;</li>
            <li>hotend;</li>
            <li>nozzle diameter;</li>
            <li>nozzle type;</li>
            <li>build surface;</li>
            <li>environmental conditions.</li>
          </ul>
          <p>
            It should not depend on whether you are sitting behind PC A, PC B or
            a laptop.
          </p>
          <p>
            OpenFilament creates a central source of truth for that information.
          </p>
          <p>
            Instead of storing valuable calibration knowledge inside isolated
            slicer installations, profiles can be stored, compared, improved and
            reused.
          </p>
        </section>

        <section className="home-section">
          <h2>Find the exact filament you are printing</h2>
          <p>Search by:</p>
          <p>
            <strong>Manufacturer</strong>
            <br />
            Flashforge, Creality, Polymaker, SUNLU, JAYO, eSUN and more.
          </p>
          <p>
            <strong>Material</strong>
            <br />
            PLA, PETG, ASA, ABS, TPU, PA-CF, PC and other materials.
          </p>
          <p>
            <strong>Product and variant</strong>
            <br />
            Not merely “ASA”, but the exact commercial filament.
          </p>
          <p>For example:</p>
          <p className="home-example">Flashforge → ASA → Burnt Titanium</p>
          <p>
            Each filament can contain its manufacturer specifications, physical
            characteristics, colors, product identifiers, barcodes, drying
            information and community knowledge.
          </p>
          <p>
            Manufacturer specifications and community measurements remain clearly
            separated.
          </p>
        </section>

        <section className="home-section">
          <h2>Profiles for your actual printer configuration</h2>
          <p>A filament does not have one universally perfect profile.</p>
          <p>
            OpenFilament therefore associates calibration data with the hardware
            on which it was measured.
          </p>
          <p>For example:</p>
          <p className="home-example">
            Flashforge ASA Burnt Titanium
            <br />
            Creality K2 Plus
            <br />
            0.6 mm hardened steel nozzle
          </p>
          <p>A profile can contain values such as:</p>
          <ul>
            <li>nozzle temperature;</li>
            <li>bed temperature;</li>
            <li>chamber temperature;</li>
            <li>flow ratio;</li>
            <li>pressure advance;</li>
            <li>maximum volumetric flow;</li>
            <li>cooling;</li>
            <li>retraction;</li>
            <li>drying recommendations;</li>
            <li>adhesion settings;</li>
            <li>filament-specific limits.</li>
          </ul>
          <p>Change printer or nozzle?</p>
          <p>
            Select that configuration and see profiles measured under comparable
            conditions.
          </p>
        </section>

        <section className="home-section">
          <h2>Community data instead of guesswork</h2>
          <p>
            OpenFilament is not intended to become another collection of
            unexplained profile files.
          </p>
          <p>Calibration results should be measurable and traceable.</p>
          <p>
            Users can submit actual calibration observations such as:
          </p>
          <ul>
            <li>temperature towers;</li>
            <li>flow-ratio tests;</li>
            <li>pressure-advance tests;</li>
            <li>maximum volumetric-flow tests;</li>
            <li>retraction tests;</li>
            <li>first-layer tests;</li>
            <li>bridging tests;</li>
            <li>dimensional tests.</li>
          </ul>
          <p>
            The platform can combine multiple independent results into a
            community recommendation.
          </p>
          <p>
            Suppose five users measure maximum volumetric flow on the same
            printer and nozzle:
          </p>
          <p className="home-example">
            29 mm³/s
            <br />
            30 mm³/s
            <br />
            31 mm³/s
            <br />
            31 mm³/s
            <br />
            45 mm³/s
          </p>
          <p>The answer should not blindly become 33.2 mm³/s.</p>
          <p>
            OpenFilament is designed to detect inconsistent measurements,
            preserve the raw results and calculate recommendations using
            transparent statistical rules.
          </p>
          <p>
            You should always be able to see where a recommended value came
            from.
          </p>
        </section>

        <section className="home-section">
          <h2>Download. Install. Print.</h2>
          <p>
            Finding a good profile should not end with manually copying twenty
            settings into your slicer.
          </p>
          <p>OpenFilament is designed around slicer integrations.</p>
          <p>The long-term goal is simple:</p>
          <p className="home-example">
            Find filament → select printer → choose profile → install
          </p>
          <p>Initial integrations focus on:</p>
          <p className="home-example">
            Creality Print
            <br />
            OrcaSlicer
          </p>
          <p>The architecture is designed to support additional slicers such as:</p>
          <ul>
            <li>PrusaSlicer</li>
            <li>Bambu Studio</li>
            <li>SuperSlicer</li>
          </ul>
          <p>
            OpenFilament uses its own vendor-independent profile format.
          </p>
          <p>
            That means a Creality profile is not converted into an Orca profile
            and then converted again.
          </p>
          <p>Instead:</p>
          <p className="home-example">
            OpenFilament Profile → Creality Print
            <br />
            or
            <br />
            OpenFilament Profile → OrcaSlicer
          </p>
          <p>The filament data remains independent from every slicer.</p>
        </section>

        <section className="home-section">
          <h2>Use the same profile on every computer</h2>
          <p>Calibrating filament should be a one-time job.</p>
          <p>
            With OpenFilament, the calibrated profile belongs to your account and
            hardware configuration rather than one local slicer installation.
          </p>
          <p>
            A future local companion application can safely synchronize profiles
            with your installed slicers.
          </p>
          <p>That means:</p>
          <p className="home-example">
            Workshop PC
            <br />
            Desktop PC
            <br />
            Laptop
          </p>
          <p>can all use the same filament knowledge.</p>
          <p>
            If a profile is updated, OpenFilament can show exactly what changed
            before anything is replaced locally.
          </p>
          <p>
            Personal modifications remain yours.
            <br />
            Community profiles remain separate.
            <br />
            Nothing should silently overwrite a carefully tuned local setup.
          </p>
        </section>

        <section className="home-section">
          <h2>RFID without filament lock-in</h2>
          <p>Automatic filament detection is useful.</p>
          <p>
            Being forced to buy a specific manufacturer&apos;s filament to use it
            is not.
          </p>
          <p>OpenFilament treats RFID for what it should be:</p>
          <p className="home-example">a way to identify a physical spool.</p>
          <p>The RFID tag does not need to become the database.</p>
          <p>The database already knows the filament.</p>
          <p>
            A tag only needs enough information to connect the physical spool to
            the correct identity.
          </p>
          <p>
            For supported systems, OpenFilament can translate filament
            information into the RFID representation expected by that ecosystem.
          </p>
        </section>

        <section className="home-section">
          <h2>Creality CFS support</h2>
          <p>
            Creality&apos;s CFS can automatically recognize RFID-equipped
            filament, but third-party filament support is unnecessarily limited.
          </p>
          <p>OpenFilament is designed to bridge that gap.</p>
          <p>A target workflow is:</p>
          <ol className="home-steps">
            <li>
              <strong>Search</strong> — Flashforge ASA Burnt Titanium
            </li>
            <li>
              <strong>Select</strong> — Creality K2 Plus, 0.6 mm nozzle
            </li>
            <li>
              <strong>Install</strong> — community calibrated slicer profile
            </li>
            <li>
              <strong>Write RFID</strong> — create a compatible CFS identification
              tag
            </li>
            <li>
              <strong>Insert spool</strong> — place the third-party spool into
              the CFS
            </li>
            <li>
              <strong>Print</strong> — associate the physical spool with the
              correct filament profile without recalibrating on every computer
            </li>
          </ol>
          <p>
            The user gets the convenience of automatic filament identification
            without being forced into a proprietary filament catalogue.
          </p>
        </section>

        <section className="home-section">
          <h2>Write RFID directly from the filament page</h2>
          <p>Where supported, a filament page can provide:</p>
          <p className="home-example">Write RFID</p>
          <p>
            OpenFilament then prepares the correct vendor-specific
            representation.
          </p>
          <p>
            A local hardware bridge communicates with a compatible RFID
            reader/writer.
          </p>
          <p>The intended process is:</p>
          <p className="home-flow">
            Detect tag → Read existing contents → Create backup → Generate
            payload → Write → Read tag again → Verify byte-for-byte → Success
          </p>
          <p>
            A write operation is never considered successful until the resulting
            tag has been read back and verified.
          </p>
        </section>

        <section className="home-section">
          <h2>Not limited to Creality</h2>
          <p>Creality CFS is an important first use case.</p>
          <p>It is not the architecture.</p>
          <p>OpenFilament separates three things:</p>
          <p>
            <strong>Filament identity</strong>
            <br />
            What physical product is this?
          </p>
          <p>
            <strong>Calibration knowledge</strong>
            <br />
            How does this filament perform on specific hardware?
          </p>
          <p>
            <strong>Integration</strong>
            <br />
            How does a particular slicer or RFID ecosystem represent that
            information?
          </p>
          <p>
            This separation allows new integrations to be added without
            redesigning the filament database.
          </p>
          <p>Today that might mean Creality CFS.</p>
          <p>
            Tomorrow it could mean another automatic material system, another
            slicer, a QR-based spool system, a custom NFC system, or an entirely
            open RFID standard.
          </p>
        </section>

        <section className="home-section">
          <h2>An open identity for every spool</h2>
          <p>Vendor RFID is optional.</p>
          <p>
            OpenFilament can also provide its own universal filament identity.
          </p>
          <p>
            Every filament variant receives a stable unique identifier.
          </p>
          <p>That identity can be represented as:</p>
          <p className="home-example">
            QR code
            <br />
            and eventually
            <br />
            OpenFilament RFID
          </p>
          <p>
            The physical label can simply point to the canonical filament record.
          </p>
          <p>
            The settings themselves remain in the database where they can be
            updated, versioned and validated.
          </p>
          <p>
            A spool does not need hundreds of configuration parameters embedded
            permanently into a tag.
          </p>
        </section>

        <section className="home-section">
          <h2>Scan a spool</h2>
          <p>Barcodes and QR codes can also be used to locate filament.</p>
          <p>OpenFilament is designed to support:</p>
          <ul>
            <li>EAN</li>
            <li>UPC</li>
            <li>GTIN</li>
            <li>manufacturer SKU</li>
            <li>manufacturer barcode</li>
            <li>OpenFilament QR</li>
          </ul>
          <p>Scan the spool and go directly to its filament page.</p>
          <p>From there you can:</p>
          <ul>
            <li>view manufacturer information;</li>
            <li>find profiles;</li>
            <li>select your printer;</li>
            <li>install settings;</li>
            <li>submit calibration results;</li>
            <li>or program a supported RFID tag.</li>
          </ul>
        </section>

        <section className="home-section">
          <h2>Your measurements remain visible</h2>
          <p>
            Community recommendations must never hide the underlying evidence.
          </p>
          <p>Every calibration can retain information such as:</p>
          <ul>
            <li>test method;</li>
            <li>measured result;</li>
            <li>selected safe operating value;</li>
            <li>printer;</li>
            <li>nozzle;</li>
            <li>slicer version;</li>
            <li>firmware version;</li>
            <li>ambient temperature;</li>
            <li>humidity;</li>
            <li>filament drying state;</li>
            <li>filament batch;</li>
            <li>date;</li>
            <li>notes;</li>
            <li>optional test photographs.</li>
          </ul>
          <p>
            This makes it possible to answer a much more useful question than:
          </p>
          <blockquote>
            “What setting does someone on the internet recommend?”
          </blockquote>
          <p>Instead:</p>
          <blockquote>
            “What have users with this exact filament, printer and nozzle
            actually measured?”
          </blockquote>
        </section>

        <section className="home-section">
          <h2>Improve existing profiles</h2>
          <p>Found a profile that is almost perfect?</p>
          <p>Do not destroy it.</p>
          <p>Fork it.</p>
          <p>A community profile might recommend:</p>
          <p className="home-example">Maximum volumetric flow: 28 mm³/s</p>
          <p>You discover your configuration reliably manages:</p>
          <p className="home-example">30 mm³/s</p>
          <p>Your personal version can retain the relationship:</p>
          <p className="home-example">Based on Community Profile v4</p>
          <p>with your modification clearly recorded.</p>
          <p>
            If enough independent measurements support the same change, the
            community recommendation may eventually improve as well.
          </p>
        </section>

        <section className="home-section">
          <h2>Every change has history</h2>
          <p>Profiles are versioned.</p>
          <p>Published calibration data is not silently rewritten.</p>
          <p>Changes create revisions.</p>
          <p>That means users can see:</p>
          <ul>
            <li>what changed;</li>
            <li>who changed it;</li>
            <li>which measurements were added;</li>
            <li>which profile version they installed;</li>
            <li>and why a newer recommendation exists.</li>
          </ul>
          <p>
            If yesterday&apos;s profile worked perfectly, that knowledge does
            not disappear because somebody edits a number today.
          </p>
        </section>

        <section className="home-section">
          <h2>Manufacturer data is not community data</h2>
          <p>If a manufacturer states:</p>
          <p className="home-example">240–260 °C</p>
          <p>
            OpenFilament records that as a manufacturer specification.
          </p>
          <p>
            If the community finds that a specific printer/nozzle combination
            performs best around:
          </p>
          <p className="home-example">255 °C</p>
          <p>
            that is recorded separately as community calibration data.
          </p>
          <p>
            Both are useful.
            <br />
            They are not the same thing.
          </p>
          <p>
            OpenFilament is designed to preserve that distinction throughout the
            platform.
          </p>
        </section>

        <section className="home-section">
          <h2>Open by design</h2>
          <p>
            The platform is intended to be independent of any single printer
            manufacturer.
          </p>
          <p>
            Its canonical data model belongs above vendor ecosystems.
          </p>
          <p>The goal is not to replace slicers.</p>
          <p>The goal is not to replace printer firmware.</p>
          <p>The goal is not to create another filament brand.</p>
          <p>
            The goal is to create the missing open knowledge layer between:
          </p>
          <p className="home-example">
            the filament you buy
            <br />
            and
            <br />
            the machine that prints it.
          </p>
        </section>

        <section className="home-section">
          <h2>Built for sharing</h2>
          <p>One person calibrating one spool helps one person.</p>
          <p>
            Thousands of users repeatedly calibrating identical filament is
            wasted effort.
          </p>
          <p>
            OpenFilament turns those isolated measurements into reusable
            knowledge.
          </p>
          <p>
            A good calibration can become useful to anyone using comparable
            hardware.
          </p>
          <p>A failed calibration is useful information too.</p>
          <p>Community members can report issues such as:</p>
          <ul>
            <li>poor bed adhesion;</li>
            <li>stringing;</li>
            <li>warping;</li>
            <li>under-extrusion;</li>
            <li>weak layer adhesion;</li>
            <li>clogging;</li>
            <li>bridging problems;</li>
            <li>dimensional inaccuracies.</li>
          </ul>
          <p>
            The database becomes more useful as evidence accumulates.
          </p>
        </section>

        <section className="home-section">
          <h2>Open API</h2>
          <p>
            The filament database is designed to be usable outside the website as
            well.
          </p>
          <p>
            A documented versioned API can allow developers to access:
          </p>
          <ul>
            <li>manufacturers;</li>
            <li>materials;</li>
            <li>filament variants;</li>
            <li>printer definitions;</li>
            <li>calibration profiles;</li>
            <li>community recommendations;</li>
            <li>profile exports;</li>
            <li>RFID mappings.</li>
          </ul>
          <p>
            This allows other open-source projects to build on the same filament
            knowledge rather than creating another isolated database.
          </p>
          <p>
            <Link href="/docs/api">Read the API documentation</Link>
          </p>
        </section>

        <section className="home-section">
          <h2>One source of truth</h2>
          <p>The fundamental architecture is deliberately simple:</p>
          <p className="home-flow">
            Filament Database → Calibration Evidence → Recommended Profiles →
            Slicer Adapters → RFID Adapters → Your printer
          </p>
          <p>The database describes the filament.</p>
          <p>Calibration data describes how it behaves.</p>
          <p>Slicer adapters translate the settings.</p>
          <p>RFID adapters identify the physical spool.</p>
          <p>
            No slicer and no printer manufacturer owns your filament library.
          </p>
        </section>

        <section className="home-section">
          <h2>The goal</h2>
          <p>Imagine buying a new spool of third-party filament.</p>
          <p>You scan it.</p>
          <p>OpenFilament recognizes the exact product.</p>
          <p>You select your printer and nozzle.</p>
          <p>Twelve other users have already calibrated that combination.</p>
          <p>You inspect their measurements.</p>
          <p>You install the recommended profile.</p>
          <p>You write a compatible RFID tag.</p>
          <p>You place the spool in your material system.</p>
          <p>Your printer recognizes it.</p>
          <p>Your other computer already has the same profile.</p>
          <p>You print.</p>
          <p>
            No repeated calibration.
            <br />
            No manually copying settings.
            <br />
            No proprietary filament requirement.
            <br />
            No artificial lock-in.
          </p>
          <p>That is what OpenFilament is intended to become.</p>
        </section>

        <section className="home-section home-close">
          <h2>Calibrate once. Improve together. Print anywhere.</h2>
          <p className="home-emphasis">
            Open filament data.
            <br />
            Open calibration knowledge.
            <br />
            Open integrations.
            <br />
            Your filament. Your profiles.
          </p>
          <div className="home-cta-links">
            <Link className="button" href="/search">
              Search filaments
            </Link>
            <Link className="button secondary" href="/submit">
              Contribute a calibration
            </Link>
          </div>
        </section>

        <section className="home-section home-catalog" id="catalog">
          <h2>Catalog</h2>
          <div className="banner-warn">{m.home.fixtureNote}</div>
          {filaments.length === 0 ? (
            <p className="muted">
              API unavailable. Start the API on{" "}
              {process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8787"}.
            </p>
          ) : (
            <ul className="list">
              {filaments.map((f) => (
                <li key={f.uuid}>
                  <Link href={`/filaments/${f.uuid}`}>
                    {f.manufacturerName} {f.productName}
                  </Link>{" "}
                  <span className="muted">({f.materialCode})</span>
                  {f.isSyntheticFixture ? (
                    <span className="muted"> — seed catalog</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </div>
  );
}
