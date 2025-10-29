import DataWebsite from '#models/data_website';
export default class ManifestController {
    async show({ response }) {
        const settings = await DataWebsite.getAllSettings();
        const manifest = {
            name: settings?.school_name || 'Opik Studio',
            short_name: settings?.school_name || 'OpikStudio',
            description: 'Aplikasi Sistem Akademik Sekolah',
            start_url: '/login',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#000000',
            icons: [
                {
                    src: settings.school_logo ? settings.school_logo : "/public/images/logo.png",
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: settings.school_logo ? settings.school_logo : "/public/images/logo.png",
                    sizes: '512x512',
                    type: 'image/png',
                },
            ],
        };
        response.header('Content-Type', 'application/manifest+json');
        return manifest;
    }
}
//# sourceMappingURL=manifest_controller.js.map