<?php

namespace App\Services;

use App\Models\Order;

class ReceiptPdfBuilder
{
    public function build(Order $order): string
    {
        $lines = [
            'Pesan Meja Resto',
            'Receipt '.$order->code,
            'Tanggal: '.$order->opened_at?->format('d-m-Y H:i'),
            'Meja: '.$order->table?->name,
            'Pelayan: '.$order->openedBy?->name,
            str_repeat('-', 32),
        ];

        foreach ($order->items as $item) {
            $lines[] = sprintf(
                '%s x%d - %s',
                $item->menuItem?->name ?? 'Item',
                $item->quantity,
                $this->currency((float) $item->subtotal),
            );
        }

        $lines[] = str_repeat('-', 32);
        $lines[] = 'Total: '.$this->currency((float) $order->total_amount);
        $lines[] = 'Kasir: '.($order->closedBy?->name ?? '-');

        return $this->renderPdf($lines);
    }

    private function renderPdf(array $lines): string
    {
        $content = "BT\n/F1 12 Tf\n50 780 Td\n14 TL\n";

        foreach ($lines as $index => $line) {
            $escaped = $this->escape($line);
            $content .= ($index === 0 ? '' : 'T*'."\n").'('.$escaped.") Tj\n";
        }

        $content .= "ET";

        $objects = [];
        $objects[] = '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj';
        $objects[] = '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj';
        $objects[] = '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj';
        $objects[] = '4 0 obj << /Length '.strlen($content).' >> stream'."\n".$content."\n".'endstream endobj';
        $objects[] = '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj';

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object."\n";
        }

        $xrefPosition = strlen($pdf);
        $pdf .= 'xref'."\n";
        $pdf .= '0 '.(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";

        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= str_pad((string) $offsets[$i], 10, '0', STR_PAD_LEFT)." 00000 n \n";
        }

        $pdf .= 'trailer << /Size '.(count($objects) + 1).' /Root 1 0 R >>'."\n";
        $pdf .= 'startxref'."\n";
        $pdf .= $xrefPosition."\n";
        $pdf .= '%%EOF';

        return $pdf;
    }

    private function escape(string $value): string
    {
        return str_replace(
            ['\\', '(', ')'],
            ['\\\\', '\\(', '\\)'],
            $value,
        );
    }

    private function currency(float $amount): string
    {
        return 'Rp '.number_format($amount, 0, ',', '.');
    }
}
