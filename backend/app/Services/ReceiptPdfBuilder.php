<?php

namespace App\Services;

use App\Models\Order;

class ReceiptPdfBuilder
{
    public function build(Order $order): string
    {
        $commands = [];
        $pageWidth = 226;
        $pageHeight = 520;
        $left = 16;
        $right = $pageWidth - 16;
        $y = $pageHeight - 24;

        $this->drawText($commands, 'PM Resto', $left, $y, 16, 'F2');
        $y -= 18;
        $this->drawText($commands, 'Receipt '.$order->code, $left, $y, 10, 'F1');
        $y -= 18;

        $this->drawLine($commands, $left, $y, $right, $y);
        $y -= 16;

        $metaLines = [
            ['Tanggal', $order->opened_at?->format('d-m-Y H:i') ?? '-'],
            ['Meja', $order->table?->name ?? '-'],
            ['Pelayan', $order->openedBy?->name ?? '-'],
            ['Kasir', $order->closedBy?->name ?? '-'],
            ['Status', strtoupper($order->status)],
        ];

        foreach ($metaLines as [$label, $value]) {
            $this->drawText($commands, $label, $left, $y, 9, 'F1');
            $this->drawText($commands, ':', $left + 44, $y, 9, 'F1');
            $this->drawText($commands, $value, $left + 52, $y, 9, 'F1');
            $y -= 13;
        }

        $y -= 4;
        $this->drawLine($commands, $left, $y, $right, $y);
        $y -= 16;

        $this->drawText($commands, 'Item', $left, $y, 9, 'F2');
        $this->drawText($commands, 'Subtotal', $right - 52, $y, 9, 'F2');
        $y -= 10;
        $this->drawLine($commands, $left, $y, $right, $y);
        $y -= 14;

        foreach ($order->items as $item) {
            $name = ($item->menuItem?->name ?? 'Item').' x'.$item->quantity;

            foreach ($this->wrapText($name, 26) as $index => $line) {
                $this->drawText($commands, $line, $left, $y, 9, $index === 0 ? 'F2' : 'F1');

                if ($index === 0) {
                    $this->drawText(
                        $commands,
                        $this->currency((float) $item->subtotal),
                        $right - 52,
                        $y,
                        9,
                        'F1'
                    );
                }

                $y -= 12;
            }

            $unitPriceLine = $item->quantity.' x '.$this->currency((float) $item->unit_price);
            $this->drawText($commands, $unitPriceLine, $left, $y, 8, 'F1');
            $y -= 11;

            if ($item->notes) {
                foreach ($this->wrapText('Catatan: '.$item->notes, 30) as $noteLine) {
                    $this->drawText($commands, $noteLine, $left + 6, $y, 8, 'F1');
                    $y -= 11;
                }
            }

            $y -= 4;
        }

        $this->drawLine($commands, $left, $y, $right, $y);
        $y -= 18;

        $this->drawText($commands, 'TOTAL', $left, $y, 11, 'F2');
        $this->drawText($commands, $this->currency((float) $order->total_amount), $right - 66, $y, 11, 'F2');
        $y -= 22;

        $this->drawLine($commands, $left, $y, $right, $y);
        $y -= 18;

        $this->drawText($commands, 'Terima kasih telah berkunjung.', $left, $y, 9, 'F1');
        $y -= 12;
        $this->drawText($commands, 'Silakan datang kembali.', $left, $y, 9, 'F1');

        return $this->renderPdf($commands, $pageWidth, $pageHeight);
    }

    private function renderPdf(array $commands, int $pageWidth, int $pageHeight): string
    {
        $content = implode("\n", $commands);

        $objects = [];
        $objects[] = '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj';
        $objects[] = '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj';
        $objects[] = '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 '.$pageWidth.' '.$pageHeight.'] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >> endobj';
        $objects[] = '4 0 obj << /Length '.strlen($content).' >> stream'."\n".$content."\n".'endstream endobj';
        $objects[] = '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj';
        $objects[] = '6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj';

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

    private function drawText(array &$commands, string $text, int|float $x, int|float $y, int|float $size, string $font): void
    {
        $commands[] = 'BT /'.$font.' '.$size.' Tf '.round($x, 2).' '.round($y, 2).' Td ('.$this->escape($text).') Tj ET';
    }

    private function drawLine(array &$commands, int|float $x1, int|float $y1, int|float $x2, int|float $y2): void
    {
        $commands[] = round($x1, 2).' '.round($y1, 2).' m '.round($x2, 2).' '.round($y2, 2).' l S';
    }

    private function wrapText(string $text, int $limit): array
    {
        $words = preg_split('/\s+/', trim($text)) ?: [];
        $lines = [];
        $current = '';

        foreach ($words as $word) {
            $candidate = $current === '' ? $word : $current.' '.$word;

            if (strlen($candidate) <= $limit) {
                $current = $candidate;
                continue;
            }

            if ($current !== '') {
                $lines[] = $current;
            }

            $current = $word;
        }

        if ($current !== '') {
            $lines[] = $current;
        }

        return $lines === [] ? ['-'] : $lines;
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
